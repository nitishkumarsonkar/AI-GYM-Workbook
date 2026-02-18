import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useWorkout } from "../../context/WorkoutContext";
import {
  getExerciseDetailWithMedia,
  ExerciseMediaDetail,
} from "../services/exerciseMediaService";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExerciseById } = useWorkout();
  const exercise = getExerciseById(Number(id));
  const [detail, setDetail] = useState<ExerciseMediaDetail | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(
    exercise?.image_url ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExercise = useCallback(
    async (forceRefresh = false) => {
      if (!exercise?.name) return;
      setLoading(true);
      setError(null);

      try {
        const result = await getExerciseDetailWithMedia(exercise.name, {
          forceRefresh,
        });

        if (result) {
          setDetail(result);
          setMediaUri(result.mediaUri ?? exercise.image_url ?? null);
        } else {
          setMediaUri(exercise.image_url ?? null);
          setError(
            "We could not load the demonstration media for this exercise.",
          );
        }
      } catch (err) {
        setError("Something went wrong while loading this exercise.");
      } finally {
        setLoading(false);
      }
    },
    [exercise?.name, exercise?.image_url],
  );

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  if (!exercise) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "Exercise" }} />
        <Text style={styles.loadingText}>Exercise not found</Text>
      </View>
    );
  }

  const instructions = detail?.exercise.instructions?.length
    ? detail.exercise.instructions
    : exercise.steps;
  const targetMuscle =
    detail?.exercise.target_muscle ??
    exercise.target_muscle ??
    exercise.tags?.[0];

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: exercise.name }} />

      {/* Image */}
      <View style={styles.mediaContainer}>
        {mediaUri ? (
          <Image
            source={{ uri: mediaUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => {
              setMediaUri(null);
              setError("Unable to load the media file.");
            }}
          />
        ) : (
          <Image
            source={require("../../assets/icon.png")}
            style={styles.placeholderImage}
            resizeMode="contain"
          />
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f4511e" />
          </View>
        )}
      </View>

      <View style={styles.refreshRow}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadExercise(true)}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? "Refreshing..." : "Refresh Media"}
          </Text>
        </TouchableOpacity>
        {targetMuscle && (
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>{targetMuscle}</Text>
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryBadge,
              exercise.category === "cardio"
                ? styles.cardioBadge
                : styles.gymBadge,
            ]}
          >
            <Text style={styles.categoryText}>
              {exercise.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.setsText}>{exercise.sets}</Text>
        </View>
        <View style={styles.tagRow}>
          {exercise.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Steps */}
      <View style={styles.stepsSection}>
        <Text style={styles.stepsTitle}>How to Perform</Text>
        {instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    backgroundColor: "#f6f6f6",
  },
  mediaContainer: {
    position: "relative",
    width: "100%",
    height: 250,
    backgroundColor: "#f6f6f6",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    tintColor: "#ccc",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffaa",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  cardioBadge: {
    backgroundColor: "#e91e6320",
  },
  gymBadge: {
    backgroundColor: "#2196f320",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
  },
  setsText: {
    fontSize: 14,
    color: "#666",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f4511e15",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#f4511e",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  stepsSection: {
    padding: 20,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  refreshRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  refreshButton: {
    backgroundColor: "#f4511e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "600",
  },
  targetBadge: {
    backgroundColor: "#f4511e15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  targetBadgeText: {
    color: "#f4511e",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  errorText: {
    color: "#d9534f",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f4511e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 0,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    flex: 1,
  },
});
