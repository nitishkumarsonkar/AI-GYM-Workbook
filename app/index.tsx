import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, Stack } from "expo-router";
import { FitnessLevel, GoalRecommendation, GoalType } from "./types";
import { getGoalRecommendations } from "./services/recommendationService";
import { logger } from "../utils/logger";
import { useAuth } from "../context/AuthContext";
import { useWorkout } from "../context/WorkoutContext";
import { fetchWorkoutLogsLast7Days } from "./services/workoutLogService";
import {
  recommendToday,
  TodayRecommendation,
} from "./recommendation/recommendationEngine";

// Dashboard Card Component
type DashboardCardProps = {
  title: string;
  emoji: string;
  href:
    | "/todays-workout"
    | "/exercise-library"
    | "/weekly-planner"
    | "/sign-in"
    | "/profile";
  description: string;
};

function DashboardCard({
  title,
  emoji,
  href,
  description,
}: DashboardCardProps) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { state } = useWorkout();

  const [selectedGoal, setSelectedGoal] = React.useState<GoalType | null>(null);
  const [recommendations, setRecommendations] = React.useState<
    GoalRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [todayEngineRecs, setTodayEngineRecs] = React.useState<
    TodayRecommendation[]
  >([]);
  const [engineLoading, setEngineLoading] = React.useState(false);
  const [engineError, setEngineError] = React.useState<string | null>(null);

  const GOALS: Array<{ key: GoalType; label: string }> = [
    { key: "mass_gain", label: "Mass Gain" },
    { key: "fat_loss", label: "Fat Loss" },
    { key: "muscle_gain", label: "Muscle Gain" },
    { key: "strength", label: "Strength" },
    { key: "endurance", label: "Endurance" },
    { key: "mobility", label: "Mobility" },
  ];

  const loadRecommendations = React.useCallback(async (goal: GoalType) => {
    try {
      setSelectedGoal(goal);
      setIsLoading(true);
      setError(null);
      setRecommendations([]);

      const recs = await getGoalRecommendations({ goal, count: 5 });
      setRecommendations(recs);
      logger.info("Goal recommendations loaded", { goal, count: recs.length });
    } catch (e) {
      logger.error("Goal recommendations failed", { goal, error: e });
      setError("Could not load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTodayEngineRecs = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setEngineLoading(true);
      setEngineError(null);

      // Determine primary goal from profile.goals[0] if present.
      const profileGoal = profile?.goals?.[0] as GoalType | undefined;
      // Prefer the goal user selected on this screen (if any), else fall back to profile.
      const goal: GoalType = selectedGoal ?? profileGoal ?? "fat_loss";
      const fitnessLevel: FitnessLevel =
        (profile?.fitness_level as FitnessLevel | undefined) ?? "beginner";

      const logs = await fetchWorkoutLogsLast7Days({
        userId: user.id,
        today: new Date(),
      });

      const recs = recommendToday({
        goal,
        fitnessLevel,
        logsLast7d: logs,
        exercises: state.exercises,
        today: new Date(),
      });

      setTodayEngineRecs(recs);
    } catch (e) {
      logger.error("Failed to load engine recommendations", { error: e });
      setEngineError("Could not load today's recommendations.");
    } finally {
      setEngineLoading(false);
    }
  }, [
    user?.id,
    profile?.goals,
    profile?.fitness_level,
    selectedGoal,
    state.exercises,
  ]);

  React.useEffect(() => {
    loadTodayEngineRecs();
  }, [loadTodayEngineRecs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "💪 GYM Workbook" }} />

      <Text style={styles.headerSubtitle}>Select a section to get started</Text>

      <DashboardCard
        title="Today's Workout"
        emoji="🏋️"
        href="/todays-workout"
        description="View your daily exercise plan"
      />

      <DashboardCard
        title="Exercise Library"
        emoji="📚"
        href="/exercise-library"
        description="Browse all gym & cardio exercises"
      />

      <DashboardCard
        title="Weekly Planner"
        emoji="📅"
        href="/weekly-planner"
        description="Manage your 7-day workout schedule"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Goal</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a goal and I’ll recommend exercises for you.
        </Text>

        <View style={styles.goalGrid}>
          {GOALS.map((g) => {
            const active = g.key === selectedGoal;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.goalChip, active && styles.goalChipActive]}
                onPress={() => loadRecommendations(g.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.goalChipText,
                    active && styles.goalChipTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedGoal ? (
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsTitle}>
              Recommendations for{" "}
              {GOALS.find((g) => g.key === selectedGoal)?.label}
            </Text>
            <TouchableOpacity
              style={styles.regenButton}
              onPress={() => loadRecommendations(selectedGoal)}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <Text style={styles.regenButtonText}>
                {isLoading ? "Loading…" : "Regenerate"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#f4511e" />
            <Text style={styles.loadingText}>Getting recommendations…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {recommendations.length > 0 ? (
          <View style={styles.recommendationsList}>
            {recommendations.map((rec, idx) => (
              <View
                key={`${rec.name}-${idx}`}
                style={styles.recommendationCard}
              >
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationName}>{rec.name}</Text>
                  <Text style={styles.recommendationCategory}>
                    {rec.category}
                  </Text>
                </View>

                {rec.rationale ? (
                  <Text style={styles.recommendationRationale}>
                    {rec.rationale}
                  </Text>
                ) : null}

                {rec.sets ? (
                  <Text style={styles.recommendationMeta}>
                    Sets/Reps: {rec.sets}
                  </Text>
                ) : null}
                {rec.duration ? (
                  <Text style={styles.recommendationMeta}>
                    Duration: {rec.duration}
                  </Text>
                ) : null}

                {rec.steps?.length ? (
                  <View style={styles.stepsBlock}>
                    <Text style={styles.stepsTitle}>How to do it</Text>
                    {rec.steps.slice(0, 5).map((s, sIdx) => (
                      <Text key={sIdx} style={styles.stepItem}>
                        {sIdx + 1}. {s}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for Today</Text>
        <Text style={styles.sectionSubtitle}>
          Based on your last 7 days + recovery rules.
        </Text>

        {!user ? (
          <Text style={styles.loadingText}>
            Sign in to see personalized recommendations.
          </Text>
        ) : null}

        {engineLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#f4511e" />
            <Text style={styles.loadingText}>Computing recommendations…</Text>
          </View>
        ) : null}

        {engineError ? (
          <Text style={styles.errorText}>{engineError}</Text>
        ) : null}

        {todayEngineRecs.length ? (
          <View style={styles.recommendationsList}>
            {todayEngineRecs.map((r) => (
              <View key={r.exercise.id} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationName}>
                    {r.exercise.name}
                  </Text>
                  <Text style={styles.recommendationCategory}>
                    {r.exercise.category}
                  </Text>
                </View>
                <Text style={styles.recommendationMeta}>{r.exercise.sets}</Text>

                {r.alternative ? (
                  <Text style={styles.recommendationMeta}>
                    Alternative: {r.alternative.name}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Stay consistent!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 120,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    // Removed shadows for web compatibility as per previous fix
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: "#888",
  },
  arrow: {
    fontSize: 28,
    color: "#ccc",
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#aaa",
    fontStyle: "italic",
  },

  section: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fafafa",
  },
  goalChipActive: {
    backgroundColor: "rgba(244, 81, 30, 0.12)",
    borderColor: "rgba(244, 81, 30, 0.35)",
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  goalChipTextActive: {
    color: "#f4511e",
  },
  recommendationsHeader: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recommendationsTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  regenButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f4511e",
    minHeight: 36,
    justifyContent: "center",
  },
  regenButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  loadingRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    color: "#b00020",
    fontSize: 13,
    fontWeight: "600",
  },
  recommendationsList: {
    marginTop: 12,
  },
  recommendationCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  recommendationName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: "#1a1a2e",
  },
  recommendationCategory: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f4511e",
    textTransform: "uppercase",
  },
  recommendationRationale: {
    marginTop: 8,
    color: "#444",
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationMeta: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  stepsBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    color: "#1a1a2e",
  },
  stepItem: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
  },
});
