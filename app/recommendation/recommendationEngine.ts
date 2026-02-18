import {
  Exercise,
  FitnessLevel,
  GoalType,
  IntensityLevel,
  WorkoutLog,
} from "../types";

export type TodayRecommendation = {
  exercise: Exercise;
  score: number;
  reasons: string[];
  alternative?: Exercise;
};

type Summary = {
  musclesWorkedYesterday: Set<string>;
  muscleLoadLast48h: Map<string, number>;
  exerciseLastSeenDaysAgo: Map<number, number>;
};

const KNOWN_MUSCLE_TAGS = new Set([
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
  "core",
  "arms",
  "full body",
]);

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function intensityWeight(intensity: IntensityLevel | null | undefined): number {
  switch (intensity) {
    case "high":
      return 2;
    case "moderate":
      return 1.5;
    case "low":
    default:
      return 1;
  }
}

function exerciseMuscles(ex: Exercise): string[] {
  const muscles = ex.tags.map(normalizeTag).filter((t) => KNOWN_MUSCLE_TAGS.has(t));

  // Normalize a few schema quirks (e.g. 'arms' implies biceps+triceps)
  const expanded = new Set<string>();
  muscles.forEach((m) => {
    if (m === "arms") {
      expanded.add("biceps");
      expanded.add("triceps");
      return;
    }
    expanded.add(m);
  });
  return Array.from(expanded);
}

function isCardioLike(ex: Exercise): boolean {
  const t = ex.tags.map(normalizeTag);
  return ex.category === "cardio" || t.includes("endurance") || t.includes("hiit");
}

function isCompoundHeavy(ex: Exercise): boolean {
  const name = ex.name.toLowerCase();
  // Heuristic for recovery rules
  return (
    name.includes("deadlift") ||
    name.includes("squat") ||
    name.includes("bench") ||
    name.includes("row") ||
    name.includes("pull-up") ||
    name.includes("overhead press")
  );
}

function daysBetween(a: string, b: string) {
  // a,b are YYYY-MM-DD
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  const diff = da.getTime() - db.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function buildSummary(params: {
  logs: WorkoutLog[];
  exercisesById: Map<number, Exercise>;
  today: string; // YYYY-MM-DD
}): Summary {
  const { logs, exercisesById, today } = params;

  const musclesWorkedYesterday = new Set<string>();
  const muscleLoadLast48h = new Map<string, number>();
  const exerciseLastSeenDaysAgo = new Map<number, number>();

  for (const log of logs) {
    const ex = exercisesById.get(log.exercise_id);
    if (!ex) continue;

    const daysAgo = daysBetween(today, log.performed_at);
    // record last seen
    const prev = exerciseLastSeenDaysAgo.get(ex.id);
    if (prev === undefined || daysAgo < prev) {
      exerciseLastSeenDaysAgo.set(ex.id, daysAgo);
    }

    // yesterday muscles
    if (daysAgo === 1) {
      for (const m of exerciseMuscles(ex)) musclesWorkedYesterday.add(m);
    }

    // 48h load
    if (daysAgo <= 2) {
      const w = intensityWeight(log.intensity);
      const base = ex.category === "gym" ? (log.sets ?? 0) : 1;
      const load = base * w;
      for (const m of exerciseMuscles(ex)) {
        muscleLoadLast48h.set(m, (muscleLoadLast48h.get(m) ?? 0) + load);
      }
    }
  }

  return { musclesWorkedYesterday, muscleLoadLast48h, exerciseLastSeenDaysAgo };
}

function isTooHardForLevel(ex: Exercise, level: FitnessLevel): boolean {
  if (level !== "beginner") return false;
  // Very rough: block compounds for beginners (can be relaxed later)
  return isCompoundHeavy(ex);
}

function isRecoveryBlocked(params: {
  ex: Exercise;
  goal: GoalType;
  summary: Summary;
}): boolean {
  const { ex, goal, summary } = params;

  const muscles = exerciseMuscles(ex);
  const overlapsYesterday = muscles.some((m) => summary.musclesWorkedYesterday.has(m));

  // Avoid consecutive-day resistance on same muscles
  if (ex.category === "gym" && overlapsYesterday) return true;

  // Fat loss: allow steady cardio even if legs were yesterday, but avoid HIIT next day on same muscles.
  if (goal === "fat_loss" && isCardioLike(ex) && overlapsYesterday) {
    const isHiiT = ex.tags.map(normalizeTag).includes("hiit");
    if (isHiiT) return true;
    return false;
  }

  return false;
}

function noveltyScore(ex: Exercise, summary: Summary): number {
  const daysAgo = summary.exerciseLastSeenDaysAgo.get(ex.id) ?? 999;
  if (daysAgo <= 1) return -30;
  if (daysAgo <= 3) return -10;
  if (daysAgo <= 7) return 5;
  return 12;
}

function recoveryScore(ex: Exercise, summary: Summary): number {
  let penalty = 0;
  for (const m of exerciseMuscles(ex)) {
    penalty += (summary.muscleLoadLast48h.get(m) ?? 0) * 8;
  }
  return -penalty;
}

function goalScore(ex: Exercise, goal: GoalType): number {
  if (goal === "fat_loss") {
    let s = 0;
    if (isCardioLike(ex)) s += 40;
    if (ex.tags.map(normalizeTag).includes("hiit")) s += 10;
    if (ex.category === "gym" && exerciseMuscles(ex).length >= 3) s += 12;
    if (ex.tags.map(normalizeTag).includes("full body")) s += 8;
    return s;
  }

  // muscle_gain
  let s = 0;
  if (ex.category === "gym") s += 40;
  if (isCompoundHeavy(ex)) s += 10;
  if (isCardioLike(ex)) s -= 10;
  return s;
}

function totalScore(ex: Exercise, goal: GoalType, summary: Summary): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const g = goalScore(ex, goal);
  if (g > 0) reasons.push("Goal-aligned");

  const r = recoveryScore(ex, summary);
  if (r < 0) reasons.push("Recovery-aware");

  const n = noveltyScore(ex, summary);
  if (n > 0) reasons.push("Variety");

  return { score: g + r + n, reasons };
}

function overlapCount(a: string[], b: string[]) {
  const set = new Set(a);
  let c = 0;
  for (const x of b) if (set.has(x)) c += 1;
  return c;
}

function findAlternative(primary: Exercise, pool: Exercise[], summary: Summary): Exercise | undefined {
  const pm = exerciseMuscles(primary);
  const candidates = pool
    .filter((e) => e.id !== primary.id)
    .filter((e) => overlapCount(exerciseMuscles(e), pm) >= Math.min(2, pm.length))
    .filter((e) => (summary.exerciseLastSeenDaysAgo.get(e.id) ?? 999) > 3);

  return candidates[0];
}

export function recommendToday(params: {
  goal: GoalType;
  fitnessLevel: FitnessLevel;
  logsLast7d: WorkoutLog[];
  exercises: Exercise[];
  today: Date;
  count?: number;
}): TodayRecommendation[] {
  const { goal, fitnessLevel, logsLast7d, exercises, today, count = 6 } = params;
  const todayStr = today.toISOString().slice(0, 10);

  const exercisesById = new Map(exercises.map((e) => [e.id, e] as const));
  const summary = buildSummary({ logs: logsLast7d, exercisesById, today: todayStr });

  // Hard filters
  const candidatePool = exercises.filter((ex) => {
    if (isTooHardForLevel(ex, fitnessLevel)) return false;
    if (isRecoveryBlocked({ ex, goal, summary })) return false;
    return true;
  });

  // Score
  const scored = candidatePool
    .map((ex) => {
      const { score, reasons } = totalScore(ex, goal, summary);
      return { ex, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  // Quota-based selection
  const picked: TodayRecommendation[] = [];

  const pickWhere = (predicate: (ex: Exercise) => boolean, n: number) => {
    for (const item of scored) {
      if (picked.length >= count) return;
      if (n <= 0) return;
      if (!predicate(item.ex)) continue;
      if (picked.some((p) => p.exercise.id === item.ex.id)) continue;
      picked.push({ exercise: item.ex, score: item.score, reasons: item.reasons });
      n -= 1;
    }
  };

  if (goal === "fat_loss") {
    pickWhere((e) => isCardioLike(e) && e.tags.map(normalizeTag).includes("hiit"), 1);
    pickWhere((e) => isCardioLike(e) && !e.tags.map(normalizeTag).includes("hiit"), 1);
    pickWhere((e) => e.category === "gym" && exerciseMuscles(e).length >= 2, 2);
    pickWhere((e) => exerciseMuscles(e).includes("core"), 1);
    pickWhere((e) => e.tags.map(normalizeTag).includes("mobility"), 1);
  } else {
    // muscle_gain
    pickWhere((e) => e.category === "gym" && isCompoundHeavy(e), 2);
    pickWhere((e) => e.category === "gym" && !isCompoundHeavy(e), 2);
    pickWhere((e) => exerciseMuscles(e).includes("core"), 1);
    pickWhere((e) => isCardioLike(e) || e.tags.map(normalizeTag).includes("mobility"), 1);
  }

  // Fill remaining
  for (const item of scored) {
    if (picked.length >= count) break;
    if (picked.some((p) => p.exercise.id === item.ex.id)) continue;
    picked.push({ exercise: item.ex, score: item.score, reasons: item.reasons });
  }

  // Add alternatives
  return picked.slice(0, count).map((p) => ({
    ...p,
    alternative: findAlternative(p.exercise, candidatePool, summary),
  }));
}
