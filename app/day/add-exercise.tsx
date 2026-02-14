import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useWorkout } from '../../context/WorkoutContext';
import { ALL_EXERCISES, getUniqueTags, Exercise } from '../../data/exerciseData';

export default function AddExerciseScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const dayName = day || 'Monday';
  const { state, addExerciseToDay } = useWorkout();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const currentPlan = state.dayPlan[dayName] || [];
  const tags = getUniqueTags();

  const availableExercises = useMemo(() => {
    let exercises = ALL_EXERCISES.filter((ex) => !currentPlan.includes(ex.id));
    if (activeTag) {
      exercises = exercises.filter((ex) => ex.tags.includes(activeTag));
    }
    return exercises;
  }, [currentPlan, activeTag]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    selectedIds.forEach((id) => addExerciseToDay(dayName, id));
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Add to ${dayName}` }} />

      {/* Tag Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        <TouchableOpacity
          style={[styles.tagPill, !activeTag && styles.activeTag]}
          onPress={() => setActiveTag(null)}
        >
          <Text style={[styles.tagText, !activeTag && styles.activeTagText]}>All</Text>
        </TouchableOpacity>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tagPill, activeTag === tag && styles.activeTag]}
            onPress={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            <Text style={[styles.tagText, activeTag === tag && styles.activeTagText]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <FlatList
        data={availableExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleSelect(item.id)}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sets}>{item.sets}</Text>
                <View style={styles.exerciseTagRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      item.category === 'cardio' ? styles.cardioBadge : styles.gymBadge,
                    ]}
                  >
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.miniTag}>
                      <Text style={styles.miniTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>All exercises already added!</Text>
          </View>
        }
      />

      {/* Add Button */}
      {selectedIds.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>
              Add {selectedIds.size} Exercise{selectedIds.size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  tagRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8e8ee',
    marginRight: 8,
  },
  activeTag: {
    backgroundColor: '#1a1a2e',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  activeTagText: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#f4511e',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#f4511e',
    borderColor: '#f4511e',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sets: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  exerciseTagRow: {
    flexDirection: 'row',
  },
  categoryBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  cardioBadge: {
    backgroundColor: '#e91e6315',
  },
  gymBadge: {
    backgroundColor: '#2196f315',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#666',
  },
  miniTag: {
    backgroundColor: '#f4511e12',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  miniTagText: {
    fontSize: 10,
    color: '#f4511e',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
