import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getExerciseById } from '../../data/exerciseData';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExerciseById(Number(id));

  if (!exercise) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Exercise' }} />
        <Text style={styles.loadingText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: exercise.name }} />

      {/* Image */}
      {exercise.image_url && (
        <Image source={{ uri: exercise.image_url }} style={styles.image} />
      )}

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryBadge,
              exercise.category === 'cardio' ? styles.cardioBadge : styles.gymBadge,
            ]}
          >
            <Text style={styles.categoryText}>{exercise.category.toUpperCase()}</Text>
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
        {exercise.steps.map((step, index) => (
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  cardioBadge: {
    backgroundColor: '#e91e6320',
  },
  gymBadge: {
    backgroundColor: '#2196f320',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
  },
  setsText: {
    fontSize: 14,
    color: '#666',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f4511e15',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#f4511e',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stepsSection: {
    padding: 20,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 0,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    flex: 1,
  },
});
