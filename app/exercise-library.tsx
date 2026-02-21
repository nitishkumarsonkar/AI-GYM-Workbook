import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { resolveExerciseForLibraryOpen } from './services/exerciseLibrarySearchService';
import {
  ExerciseDbExercise,
  searchExercisesByName,
} from './services/exerciseDbService';
import { logger } from '../utils/logger';

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

function SearchExerciseCard({
  exercise,
  onPress,
  opening,
}: {
  exercise: ExerciseDbExercise;
  onPress: () => void;
  opening: boolean;
}) {
  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} disabled={opening}>
      <View style={styles.listCardInfo}>
        <Text style={styles.listCardName}>{exercise.name}</Text>
        <Text style={styles.listCardSets}>
          {[exercise.bodyPart, exercise.target].filter(Boolean).join(' • ') || 'ExerciseDB result'}
        </Text>
      </View>
      {opening ? <ActivityIndicator color="#f4511e" /> : <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getExercisesByCategory, getUniqueTags, upsertExercise, state } = useWorkout();
  const [activeTab, setActiveTab] = useState<'cardio' | 'gym' | 'search'>('gym');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseDbExercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [openingExerciseId, setOpeningExerciseId] = useState<string | null>(null);

  const selectedCategory = activeTab === 'cardio' ? 'cardio' : 'gym';
  const tags = useMemo(
    () => (activeTab === 'search' ? [] : getUniqueTags(selectedCategory)),
    [activeTab, selectedCategory, state.exercises],
  );

  const filteredExercises = useMemo(() => {
    if (activeTab === 'search') {
      return [];
    }

    const exercises = getExercisesByCategory(selectedCategory);
    if (activeTag) {
      return exercises.filter((ex) => ex.tags.includes(activeTag));
    }
    return exercises;
  }, [activeTab, selectedCategory, activeTag, state.exercises]);

  const handleSearch = async () => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      return;
    }

    setSearchError(null);
    setIsSearching(true);
    try {
      const results = await searchExercisesByName(normalizedQuery);
      setSearchResults(results);
    } catch (error) {
      logger.error('Search failed for exercise library', { error, query: normalizedQuery });
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultPress = async (exercise: ExerciseDbExercise) => {
    setOpeningExerciseId(exercise.id);
    try {
      const resolved = await resolveExerciseForLibraryOpen(exercise);
      if (resolved.status === 'auth_required') {
        Alert.alert(
          'Sign in required',
          'Sign in required to save this exercise and open details.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => router.push('/sign-in'),
            },
          ],
        );
        return;
      }

      if (resolved.status === 'error') {
        Alert.alert('Unable to open exercise', resolved.message);
        return;
      }

      upsertExercise(resolved.exercise);
      router.push(`/exercise/${resolved.exercise.id}`);
    } finally {
      setOpeningExerciseId(null);
    }
  };

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
          <TouchableOpacity
            style={[styles.tab, styles.lastTab, activeTab === 'search' && styles.activeTab]}
            onPress={() => { setActiveTab('search'); setActiveTag(null); }}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              🔎 Search
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'search' ? (
          <View style={styles.searchContainer}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises from ExerciseDB"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                (!searchQuery.trim() || isSearching) && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </View>

      {/* Scrollable List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {activeTab === 'search' ? (
          <>
            {searchError ? <Text style={styles.searchError}>{searchError}</Text> : null}
            {!isSearching && searchResults.length === 0 && searchQuery.trim().length > 0 ? (
              <Text style={styles.searchEmptyText}>No exercises found for "{searchQuery.trim()}".</Text>
            ) : null}
            {!isSearching && searchResults.length === 0 && searchQuery.trim().length === 0 ? (
              <Text style={styles.searchEmptyText}>Search ExerciseDB by name to discover exercises.</Text>
            ) : null}
            {searchResults.map((exercise) => (
              <SearchExerciseCard
                key={exercise.id}
                exercise={exercise}
                opening={openingExerciseId === exercise.id}
                onPress={() => handleSearchResultPress(exercise)}
              />
            ))}
            {!user ? (
              <Text style={styles.searchHintText}>
                You can search while logged out. Sign in is required to save missing exercises to your library.
              </Text>
            ) : null}
          </>
        ) : (
          filteredExercises.map((ex) => (
            <ExerciseCardList key={ex.id} exercise={ex} />
          ))
        )}
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
  lastTab: {
    marginRight: 0,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dedede',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#f4511e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minWidth: 86,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  searchError: {
    color: '#b00020',
    fontSize: 13,
    marginBottom: 10,
  },
  searchEmptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  searchHintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
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
