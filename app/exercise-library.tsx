import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useWorkout } from '../context/WorkoutContext';

// Exercise Card Component
function ExerciseCardList({ exercise }) {
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

export default function ExerciseLibraryScreen() {
  const { getExercisesByCategory, getUniqueTags, state } = useWorkout();
  const [activeTab, setActiveTab] = useState<'cardio' | 'gym'>('gym');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => getUniqueTags(activeTab), [activeTab, state.exercises]);

  const filteredExercises = useMemo(() => {
    const exercises = getExercisesByCategory(activeTab);
    if (activeTag) {
      return exercises.filter((ex) => ex.tags.includes(activeTag));
    }
    return exercises;
  }, [activeTab, activeTag, state.exercises]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Exercise Library' }} />

      {/* Fixed Header with Tabs and Tags */}
      <View style={styles.headerContainer}>
        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gym' && styles.activeTab]}
            onPress={() => { setActiveTab('gym'); setActiveTag(null); }}
          >
            <Text style={[styles.tabText, activeTab === 'gym' && styles.activeTabText]}>
              🏋️ Gym Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cardio' && styles.activeTab]}
            onPress={() => { setActiveTab('cardio'); setActiveTag(null); }}
          >
            <Text style={[styles.tabText, activeTab === 'cardio' && styles.activeTabText]}>
              🫀 Cardio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tag Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagPillRow}
        >
          <TouchableOpacity
            style={[styles.tagPill, !activeTag && styles.activeTagPill]}
            onPress={() => setActiveTag(null)}
          >
            <Text style={[styles.tagPillText, !activeTag && styles.activeTagPillText]}>All</Text>
          </TouchableOpacity>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagPill, activeTag === tag && styles.activeTagPill]}
              onPress={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              <Text style={[styles.tagPillText, activeTag === tag && styles.activeTagPillText]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredExercises.map((ex) => (
          <ExerciseCardList key={ex.id} exercise={ex} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e8e8ee',
    alignItems: 'center',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#f4511e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  // Tag Pills
  tagPillRow: {
    paddingBottom: 4,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8e8ee',
    marginRight: 8,
  },
  activeTagPill: {
    backgroundColor: '#1a1a2e',
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  activeTagPillText: {
    color: '#fff',
  },
  // List Card
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
