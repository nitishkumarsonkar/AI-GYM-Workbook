import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useWorkout } from '../context/WorkoutContext';
import { getTodayName, DAY_FOCUS, Exercise } from './types';

// Reusing the list card style for consistency
function ExerciseCardList({ exercise }: { exercise: Exercise }) {
  return (
    <Link href={`/exercise/${exercise.id}`} asChild>
      <TouchableOpacity style={styles.listCard}>
        <View style={styles.listCardInfo}>
          <Text style={styles.listCardName}>{exercise.name}</Text>
          <Text style={styles.listCardSets}>{exercise.sets}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function TodaysWorkoutScreen() {
  const { state, getExercisesByIds } = useWorkout();
  const todayName = getTodayName();
  const todayExercises = getExercisesByIds(state.dayPlan[todayName] || []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: "Today's Workout" }} />

      <View style={styles.content}>
        <View style={styles.todayBanner}>
          <Text style={styles.todayDay}>{todayName}</Text>
          <Text style={styles.todayFocus}>{DAY_FOCUS[todayName] || 'Workout'}</Text>
        </View>

        {todayExercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>🧘 Rest Day — No exercises scheduled</Text>
          </View>
        ) : (
          <View>
             {todayExercises.map((ex) => (
                <ExerciseCardList key={ex.id} exercise={ex} />
             ))}
          </View>
        )}
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
  todayBanner: {
    backgroundColor: '#f4511e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  todayDay: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  todayFocus: {
    color: '#ffffffcc',
    fontSize: 14,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  listCardInfo: {
    flex: 1,
  },
  listCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listCardSets: {
    fontSize: 12,
    color: '#888',
  },
  arrow: {
    fontSize: 22,
    color: '#ccc',
    marginLeft: 8,
  },
});
