import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_DAY_PLAN, DayPlan } from '../data/exerciseData';

// ─── Types ───────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PLAN'; payload: DayPlan }
  | { type: 'ADD_EXERCISE_TO_DAY'; day: string; exerciseId: number }
  | { type: 'REMOVE_EXERCISE_FROM_DAY'; day: string; exerciseId: number };

type WorkoutState = {
  dayPlan: DayPlan;
};

type WorkoutContextType = {
  state: WorkoutState;
  addExerciseToDay: (day: string, exerciseId: number) => void;
  removeExerciseFromDay: (day: string, exerciseId: number) => void;
};

// ─── Reducer ─────────────────────────────────────────────────────────

function workoutReducer(state: WorkoutState, action: Action): WorkoutState {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, dayPlan: action.payload };
    case 'ADD_EXERCISE_TO_DAY': {
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
    case 'REMOVE_EXERCISE_FROM_DAY': {
      const current = state.dayPlan[action.day] || [];
      return {
        ...state,
        dayPlan: {
          ...state.dayPlan,
          [action.day]: current.filter((id) => id !== action.exerciseId),
        },
      };
    }
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEY = '@gym_workout_plan';

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, {
    dayPlan: DEFAULT_DAY_PLAN,
  });

  // Load persisted plan on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          dispatch({ type: 'SET_PLAN', payload: JSON.parse(stored) });
        }
      } catch (e) {
        console.warn('Failed to load workout plan:', e);
      }
    })();
  }, []);

  // Persist on every change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.dayPlan)).catch(console.warn);
  }, [state.dayPlan]);

  const addExerciseToDay = (day: string, exerciseId: number) => {
    dispatch({ type: 'ADD_EXERCISE_TO_DAY', day, exerciseId });
  };

  const removeExerciseFromDay = (day: string, exerciseId: number) => {
    dispatch({ type: 'REMOVE_EXERCISE_FROM_DAY', day, exerciseId });
  };

  return (
    <WorkoutContext.Provider value={{ state, addExerciseToDay, removeExerciseFromDay }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
