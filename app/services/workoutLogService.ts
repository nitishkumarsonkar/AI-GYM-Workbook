import { supabase } from "../../lib/supabase";
import { logger } from "../../utils/logger";
import { IntensityLevel, WorkoutLog } from "../types";

export async function fetchWorkoutLogsLast7Days(params: {
  userId: string;
  today: Date;
}): Promise<WorkoutLog[]> {
  const { userId, today } = params;

  const from = new Date(today);
  from.setDate(from.getDate() - 6);

  const fromDate = from.toISOString().slice(0, 10);
  const toDate = today.toISOString().slice(0, 10);

  logger.info("Fetching workout logs", { userId, fromDate, toDate });

  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("performed_at", fromDate)
    .lte("performed_at", toDate)
    .order("performed_at", { ascending: false });

  if (error) {
    logger.error("Failed to fetch workout logs", { userId, error });
    return [];
  }

  return (data ?? []) as WorkoutLog[];
}

export async function insertWorkoutLog(params: {
  userId: string;
  exerciseId: number;
  performedAt: string; // YYYY-MM-DD
  sets?: number | null;
  reps?: number | null;
  intensity?: IntensityLevel | null;
}): Promise<boolean> {
  const { userId, exerciseId, performedAt, sets = null, reps = null, intensity = null } =
    params;

  const { error } = await supabase.from("workout_logs").insert({
    user_id: userId,
    exercise_id: exerciseId,
    performed_at: performedAt,
    sets,
    reps,
    intensity,
  });

  if (error) {
    logger.error("Failed to insert workout log", {
      userId,
      exerciseId,
      performedAt,
      error,
    });
    return false;
  }

  logger.info("Workout log inserted", { userId, exerciseId, performedAt });
  return true;
}
