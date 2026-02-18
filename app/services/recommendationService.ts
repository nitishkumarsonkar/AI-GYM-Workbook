import { supabase } from '../../lib/supabase';
import { GoalRecommendation, GoalType } from '../types';
import { logger } from '../../utils/logger';

type RecommendExercisesResponse = {
  goal: string;
  recommendations: GoalRecommendation[];
};

export async function getGoalRecommendations(params: {
  goal: GoalType;
  count?: number;
}): Promise<GoalRecommendation[]> {
  const { goal, count = 5 } = params;

  logger.info('Requesting goal recommendations', { goal, count });

  const { data, error } = await supabase.functions.invoke<RecommendExercisesResponse>(
    'recommend-exercises',
    {
      body: { goal, count },
    }
  );

  if (error) {
    logger.error('Failed to fetch goal recommendations', {
      goal,
      count,
      error,
    });
    throw error;
  }

  const recs = data?.recommendations ?? [];
  logger.info('Received goal recommendations', { goal, count: recs.length });
  return recs;
}
