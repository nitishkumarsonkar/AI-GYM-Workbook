import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Link, Stack, useRouter } from 'expo-router';
import { useWorkout } from '../../context/WorkoutContext';
import { getExercisesByIds, DAY_FOCUS, Exercise } from '../../data/exerciseData';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dayName = id || 'Monday';
  const { state, removeExerciseFromDay } = useWorkout();
  const router = useRouter();

  const exercises = getExercisesByIds(state.dayPlan[dayName] || []);

  const handleRemove = (exercise: Exercise) => {
    Alert.alert(
      'Remove Exercise',
      `Remove "${exercise.name}" from ${dayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeExerciseFromDay(dayName, exercise.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${dayName}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/day/add-exercise?day=${dayName}`)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Focus Banner */}
      <View style={styles.focusBanner}>
        <Text style={styles.focusText}>{DAY_FOCUS[dayName] || 'Workout'}</Text>
        <Text style={styles.countText}>{exercises.length} exercises</Text>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🧘</Text>
          <Text style={styles.emptyTitle}>Rest Day</Text>
          <Text style={styles.emptySubtitle}>No exercises scheduled</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => router.push(`/day/add-exercise?day=${dayName}`)}
          >
            <Text style={styles.emptyAddButtonText}>+ Add Exercises</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Link href={`/exercise/${item.id}`} asChild>
                <TouchableOpacity style={styles.cardContent}>
                  <View style={styles.indexCircle}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseSets}>{item.sets}</Text>
                    <View style={styles.tagRow}>
                      {item.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff30',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  focusBanner: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  countText: {
    color: '#ffffffcc',
    fontSize: 13,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingRight: 40,
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  info: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseSets: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#f4511e12',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#f4511e',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  arrow: {
    fontSize: 22,
    color: '#ccc',
  },
  removeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff000015',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
