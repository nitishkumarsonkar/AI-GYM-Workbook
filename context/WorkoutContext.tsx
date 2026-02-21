import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_DAY_PLAN, DayPlan, Exercise } from "../app/types";
import { supabase } from "../lib/supabase";
import {
  fetchUserPlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
  fetchExercises,
} from "../app/services/workoutService";
import { getSessionUser } from "../app/services/authService";
import { logger } from "../utils/logger";

// ─── Types ───────────────────────────────────────────────────────────

type Action =
  | { type: "SET_PLAN"; payload: DayPlan }
  | { type: "ADD_EXERCISE_TO_DAY"; day: string; exerciseId: number }
  | { type: "REMOVE_EXERCISE_FROM_DAY"; day: string; exerciseId: number }
  | { type: "UPSERT_EXERCISE"; payload: Exercise };

type WorkoutState = {
  dayPlan: DayPlan;
  exercises: Exercise[];
};

type WorkoutContextType = {
  state: WorkoutState;
  addExerciseToDay: (day: string, exerciseId: number) => void;
  removeExerciseFromDay: (day: string, exerciseId: number) => void;
  upsertExercise: (exercise: Exercise) => void;
  // Helpers mimicking old exerciseData API
  getExerciseById: (id: number) => Exercise | undefined;
  getExercisesByCategory: (category: "cardio" | "gym") => Exercise[];
  getExercisesByTag: (tag: string) => Exercise[];
  getUniqueTags: (category?: "cardio" | "gym") => string[];
  getExercisesByIds: (ids: number[]) => Exercise[];
};

// ─── Reducer ─────────────────────────────────────────────────────────

function workoutReducer(
  state: WorkoutState,
  action: Action | { type: "SET_EXERCISES"; payload: Exercise[] },
): WorkoutState {
  switch (action.type) {
    case "SET_EXERCISES":
      return { ...state, exercises: action.payload };
    case "SET_PLAN":
      return { ...state, dayPlan: action.payload };
    case "ADD_EXERCISE_TO_DAY": {
      const current = state.dayPlan[action.day] || [];
      if (current.includes(action.exerciseId)) return state;
      return {
        ...state,
        dayPlan: {
          ...state.dayPlan,
          [action.day]: [...current, action.exerciseId],
        },
      };
    }
    case "REMOVE_EXERCISE_FROM_DAY": {
      const current = state.dayPlan[action.day] || [];
      return {
        ...state,
        dayPlan: {
          ...state.dayPlan,
          [action.day]: current.filter((id) => id !== action.exerciseId),
        },
      };
    }
    case "UPSERT_EXERCISE": {
      const existingIndex = state.exercises.findIndex(
        (exercise) => exercise.id === action.payload.id,
      );

      if (existingIndex === -1) {
        return { ...state, exercises: [...state.exercises, action.payload] };
      }

      const nextExercises = [...state.exercises];
      nextExercises[existingIndex] = action.payload;
      return { ...state, exercises: nextExercises };
    }
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEY = "@gym_workout_plan";

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [state, dispatch] = useReducer(workoutReducer, {
    dayPlan: DEFAULT_DAY_PLAN,
    exercises: [],
  });

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        // Fetch Exercises
        logger.info("Fetching exercises from Supabase...");
        const exercisesData = await fetchExercises();
        logger.info("Fetched exercises", { count: exercisesData.length });
        dispatch({ type: "SET_EXERCISES", payload: exercisesData });

        // Authenticate & Fetch Plan
        const user = await getSessionUser();

        if (user) {
          logger.info("User logged in, fetching plan from Supabase...");
          const remotePlan = await fetchUserPlan();
          dispatch({ type: "SET_PLAN", payload: remotePlan });
        } else {
          logger.info("No user, loading plan from local storage...");
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            dispatch({ type: "SET_PLAN", payload: JSON.parse(stored) });
          }
        }
      } catch (e) {
        logger.warn("Failed to load data", { error: e });
      } finally {
        setIsInitialized(true);
      }
    })();
  }, []);

  // Persist to Local Storage on every change (as cache/offline)
  // Persist to Local Storage on every change (as cache/offline)
  useEffect(() => {
    if (!isInitialized) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.dayPlan)).catch(
      (e) => logger.warn("Failed to persist day plan to storage", { error: e }),
    );
  }, [state.dayPlan, isInitialized]);

  const addExerciseToDay = (day: string, exerciseId: number) => {
    // 1. Optimistic Update
    dispatch({ type: "ADD_EXERCISE_TO_DAY", day, exerciseId });

    // 2. Sync to Supabase (fire and forget)
    addExerciseToPlan(day, exerciseId);
  };

  const removeExerciseFromDay = (day: string, exerciseId: number) => {
    // 1. Optimistic Update
    dispatch({ type: "REMOVE_EXERCISE_FROM_DAY", day, exerciseId });

    // 2. Sync to Supabase (fire and forget)
    removeExerciseFromPlan(day, exerciseId);
  };

  const upsertExercise = (exercise: Exercise) => {
    dispatch({ type: "UPSERT_EXERCISE", payload: exercise });
  };

  // Helper functions
  const getExerciseById = (id: number) =>
    state.exercises.find((ex) => ex.id === id);

  const getExercisesByCategory = (category: "cardio" | "gym") =>
    state.exercises.filter((ex) => ex.category === category);

  const getExercisesByTag = (tag: string) =>
    state.exercises.filter((ex) => ex.tags.includes(tag));

  const getUniqueTags = (category?: "cardio" | "gym") => {
    const exercises = category
      ? getExercisesByCategory(category)
      : state.exercises;
    const tagSet = new Set<string>();
    exercises.forEach((ex) => ex.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  };

  const getExercisesByIds = (ids: number[]) =>
    ids.map((id) => getExerciseById(id)).filter((ex): ex is Exercise => !!ex);

  return (
    <WorkoutContext.Provider
      value={{
        state,
        addExerciseToDay,
        removeExerciseFromDay,
        upsertExercise,
        getExerciseById,
        getExercisesByCategory,
        getExercisesByTag,
        getUniqueTags,
        getExercisesByIds,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
