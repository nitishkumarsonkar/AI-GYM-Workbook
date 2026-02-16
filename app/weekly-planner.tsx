import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Link, Stack } from "expo-router";
import { useWorkout } from "../context/WorkoutContext";
import { DAY_FOCUS } from "./types";

// Reusing styles from index.tsx logic
const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeeklyPlannerScreen() {
  const { state, getExercisesByIds } = useWorkout();
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    let totalExercises = 0;
    let activeDays = 0;
    DAYS_ORDER.forEach((day) => {
      const count = (state.dayPlan[day] || []).length;
      if (count > 0) {
        totalExercises += count;
        activeDays++;
      }
    });
    return { totalExercises, activeDays };
  }, [state.dayPlan]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: "#f8f9fa" },
          headerShadowVisible: false,
          headerTintColor: "#333",
        }}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weekly Plan</Text>
          <Text style={styles.headerSubtitle}>
            {weeklyStats.activeDays} active days • {weeklyStats.totalExercises}{" "}
            exercises
          </Text>
        </View>
        <View style={styles.headerIconCircle}>
          <Text style={styles.headerIcon}>📅</Text>
        </View>
      </View>

      <View style={styles.list}>
        {DAYS_ORDER.map((day) => {
          const exercises = getExercisesByIds(state.dayPlan[day] || []);
          const isToday = day === todayName;
          const isRest = exercises.length === 0;

          // Determine status color
          let statusColor = "#2e7d32"; // Default Green (Active Normal)
          if (isToday)
            statusColor = "#f4511e"; // Orange (Today)
          else if (isRest) statusColor = "#bdbdbd"; // Grey (Rest)

          return (
            <Link key={day} href={`/day/${day}`} asChild>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.card,
                  { borderLeftColor: statusColor },
                  isToday && styles.cardToday,
                  isRest && !isToday && styles.cardRest,
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.dayContainer}>
                      <Text
                        style={[styles.dayName, isToday && styles.dayNameToday]}
                      >
                        {day}
                      </Text>
                      {isToday && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayText}>TODAY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.focusText}>
                      {DAY_FOCUS[day] || "Recovery"}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsIcon}>
                        {isRest ? "🧘" : "💪"}
                      </Text>
                      <Text style={styles.statsText}>
                        {isRest ? "Rest Day" : `${exercises.length} Exercises`}
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text
                        style={[
                          styles.actionText,
                          isToday && styles.actionTextToday,
                        ]}
                      >
                        {isRest ? "View" : "Start"}
                      </Text>
                      <Text
                        style={[styles.arrow, isToday && styles.arrowToday]}
                      >
                        →
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerIcon: {
    fontSize: 24,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderLeftWidth: 6, // Use border directly for the indicator
    // Other borders
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee", // More visible border
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, // Slightly darker shadow
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 0, // Using gap in list
  },
  cardToday: {
    backgroundColor: "#fff",
    borderColor: "#f4511e20",
    shadowColor: "#f4511e",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardRest: {
    opacity: 0.9,
    backgroundColor: "#fcfcfc",
  },
  cardContent: {
    padding: 16,
    paddingLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  dayNameToday: {
    color: "#f4511e",
  },
  todayBadge: {
    backgroundColor: "#f4511e15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#f4511e",
    letterSpacing: 0.5,
  },
  focusText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsIcon: {
    fontSize: 14,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  actionTextToday: {
    color: "#f4511e",
  },
  arrow: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
  },
  arrowToday: {
    color: "#f4511e",
  },
  bottomSpacer: {
    height: 20,
  },
});
