import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useWorkout } from '../context/WorkoutContext';
import { getExercisesByIds, DAY_FOCUS } from '../data/exerciseData';

// Reusing styles from index.tsx logic
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlannerScreen() {
  const { state } = useWorkout();
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Weekly Planner' }} />
      <View style={styles.content}>
        {DAYS_ORDER.map((day) => {
          const exercises = getExercisesByIds(state.dayPlan[day] || []);
          const isToday = day === todayName;

          return (
            <Link key={day} href={`/day/${day}`} asChild>
              <TouchableOpacity style={[styles.dayCard, isToday && styles.dayCardToday]}>
                <View style={styles.dayCardHeader}>
                  <Text style={[styles.dayCardName, isToday && styles.dayCardNameToday]}>
                    {day} {isToday ? '(Today)' : ''}
                  </Text>
                  <Text style={styles.dayCardFocus}>{DAY_FOCUS[day]}</Text>
                </View>
                <Text style={styles.dayCardCount}>
                  {exercises.length === 0
                    ? 'Rest'
                    : `${exercises.length} exercise${exercises.length > 1 ? 's' : ''}`}
                </Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  content: {
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  dayCardToday: {
    borderLeftWidth: 4,
    borderLeftColor: '#f4511e',
  },
  dayCardHeader: {
    flex: 1,
  },
  dayCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayCardNameToday: {
    color: '#f4511e',
  },
  dayCardFocus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  dayCardCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
});
