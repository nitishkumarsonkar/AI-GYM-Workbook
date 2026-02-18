import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Link, Stack } from "expo-router";
import { useWorkout } from "../context/WorkoutContext";
import { getTodayName, DAY_FOCUS, Exercise } from "./types";
import { useAuth } from "../context/AuthContext";
import { insertWorkoutLog } from "./services/workoutLogService";
import { logger } from "../utils/logger";

// Reusing the list card style for consistency
function ExerciseCardList({
  exercise,
  onLog,
}: {
  exercise: Exercise;
  onLog: (exercise: Exercise) => void;
}) {
  return (
    <View style={styles.listCard}>
      <Link href={`/exercise/${exercise.id}`} asChild>
        <TouchableOpacity style={styles.listCardPressable}>
          <View style={styles.listCardInfo}>
            <Text style={styles.listCardName}>{exercise.name}</Text>
            <Text style={styles.listCardSets}>{exercise.sets}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={styles.logButton}
        onPress={() => onLog(exercise)}
        accessibilityRole="button"
      >
        <Text style={styles.logButtonText}>Log</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TodaysWorkoutScreen() {
  const { state, getExercisesByIds } = useWorkout();
  const { user } = useAuth();
  const todayName = getTodayName();
  const todayExercises = getExercisesByIds(state.dayPlan[todayName] || []);

  const [logModalOpen, setLogModalOpen] = React.useState(false);
  const [logExercise, setLogExercise] = React.useState<Exercise | null>(null);
  const [logSets, setLogSets] = React.useState<string>("3");
  const [logReps, setLogReps] = React.useState<string>("10");
  const [logIntensity, setLogIntensity] = React.useState<
    "low" | "moderate" | "high"
  >("moderate");
  const [savingLog, setSavingLog] = React.useState(false);

  const handleLog = React.useCallback(
    (exercise: Exercise) => {
      if (!user?.id) {
        Alert.alert("Please sign in", "Sign in to log workouts.");
        return;
      }

      setLogExercise(exercise);
      setLogModalOpen(true);
      logger.info("Workout log modal opened", { exerciseId: exercise.id });
    },
    [user?.id],
  );

  const saveLog = React.useCallback(async () => {
    if (!user?.id || !logExercise) return;
    setSavingLog(true);
    try {
      const performedAt = new Date().toISOString().slice(0, 10);

      const sets = logSets ? Number(logSets.replace(/[^0-9]/g, "")) : null;
      const reps = logReps ? Number(logReps.replace(/[^0-9]/g, "")) : null;

      const ok = await insertWorkoutLog({
        userId: user.id,
        exerciseId: logExercise.id,
        performedAt,
        sets: Number.isFinite(sets as number) ? (sets as number) : null,
        reps: Number.isFinite(reps as number) ? (reps as number) : null,
        intensity: logIntensity,
      });

      if (!ok) {
        Alert.alert("Failed", "Could not save log.");
        return;
      }

      setLogModalOpen(false);
      setLogExercise(null);
      Alert.alert("Saved", "Workout logged.");
    } finally {
      setSavingLog(false);
    }
  }, [user?.id, logExercise, logSets, logReps, logIntensity]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: "Today's Workout" }} />

      <View style={styles.content}>
        <View style={styles.todayBanner}>
          <Text style={styles.todayDay}>{todayName}</Text>
          <Text style={styles.todayFocus}>
            {DAY_FOCUS[todayName] || "Workout"}
          </Text>
        </View>

        {todayExercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              🧘 Rest Day — No exercises scheduled
            </Text>
          </View>
        ) : (
          <View>
            {todayExercises.map((ex) => (
              <ExerciseCardList key={ex.id} exercise={ex} onLog={handleLog} />
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={logModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLogModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log workout</Text>
            <Text style={styles.modalSubtitle}>{logExercise?.name}</Text>

            <View style={styles.modalRow}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Sets</Text>
                <TextInput
                  style={styles.modalInput}
                  value={logSets}
                  onChangeText={setLogSets}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Reps</Text>
                <TextInput
                  style={styles.modalInput}
                  value={logReps}
                  onChangeText={setLogReps}
                  keyboardType="numeric"
                  placeholder="10"
                />
              </View>
            </View>

            <Text style={styles.modalLabel}>Intensity</Text>
            <View style={styles.intensityRow}>
              {(
                [
                  { key: "low", label: "Low" },
                  { key: "moderate", label: "Moderate" },
                  { key: "high", label: "High" },
                ] as const
              ).map((opt) => {
                const active = logIntensity === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.intensityChip,
                      active && styles.intensityChipActive,
                    ]}
                    onPress={() => setLogIntensity(opt.key)}
                  >
                    <Text
                      style={[
                        styles.intensityChipText,
                        active && styles.intensityChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setLogModalOpen(false)}
                disabled={savingLog}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={saveLog}
                disabled={savingLog}
              >
                <Text style={styles.modalSaveText}>
                  {savingLog ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  content: {
    padding: 16,
  },
  todayBanner: {
    backgroundColor: "#f4511e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  todayDay: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  todayFocus: {
    color: "#ffffffcc",
    fontSize: 14,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  listCard: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  listCardPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  listCardInfo: {
    flex: 1,
  },
  listCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  listCardSets: {
    fontSize: 12,
    color: "#888",
  },
  arrow: {
    fontSize: 22,
    color: "#ccc",
    marginLeft: 8,
  },
  logButton: {
    marginTop: 10,
    backgroundColor: "#f4511e",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  logButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a1a2e",
  },
  modalSubtitle: {
    marginTop: 4,
    color: "#666",
    fontWeight: "700",
    marginBottom: 14,
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalField: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#555",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontWeight: "700",
    color: "#333",
  },
  intensityRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  intensityChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fafafa",
  },
  intensityChipActive: {
    backgroundColor: "rgba(244, 81, 30, 0.12)",
    borderColor: "rgba(244, 81, 30, 0.35)",
  },
  intensityChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#555",
  },
  intensityChipTextActive: {
    color: "#f4511e",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontWeight: "900",
    color: "#444",
  },
  modalSave: {
    flex: 1,
    backgroundColor: "#f4511e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSaveText: {
    fontWeight: "900",
    color: "#fff",
  },
});
