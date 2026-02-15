import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, Link, Stack, useRouter } from 'expo-router';
import { useWorkout } from '../../context/WorkoutContext';
import { DAY_FOCUS, Exercise } from '../types';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dayName = id || 'Monday';
  const { state, removeExerciseFromDay, getExercisesByIds } = useWorkout();
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
          title: '', // Custom header title
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerShadowVisible: false,
          headerTintColor: '#333',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/day/add-exercise?day=${dayName}`)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{dayName}</Text>
          <View style={styles.focusBadge}>
             <Text style={styles.focusText}>{DAY_FOCUS[dayName] || 'Rest & Recovery'}</Text>
          </View>
        </View>
        <View style={styles.statsBadge}>
          <Text style={styles.statsCount}>{exercises.length}</Text>
          <Text style={styles.statsLabel}>Exercises</Text>
        </View>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyEmoji}>🧘</Text>
          </View>
          <Text style={styles.emptyTitle}>Rest Day</Text>
          <Text style={styles.emptySubtitle}>No exercises scheduled for today.</Text>
          <Text style={styles.emptySubtitle}>Enjoy your recovery!</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => router.push(`/day/add-exercise?day=${dayName}`)}
          >
            <Text style={styles.emptyAddButtonText}>Add Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Link href={`/exercise/${item.id}`} asChild>
                <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>
                  <View style={styles.indexContainer}>
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
                  <View style={styles.arrowContainer}>
                     <Text style={styles.arrow}>→</Text>
                  </View>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -1,
  },
  focusBadge: {
    backgroundColor: '#f4511e15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  focusText: {
    color: '#f4511e',
    fontSize: 14,
    fontWeight: '600',
  },
  statsBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 40, // Space for remove button
  },
  indexContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  exerciseSets: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f4511e10',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: '#f4511e',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    zIndex: 10,
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
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAddButton: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
    shadowColor: '#f4511e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
