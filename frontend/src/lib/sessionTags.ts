import type { TrainingSession } from '@/types/models';

export interface SessionTag {
  emoji: string;
  label: string;
}

// ─── Thresholds for session quality tags ──────────────────
const SCORE_ELITE = 95;
const SCORE_ON_FIRE = 90;
const SCORE_STRONG = 80;
const GOAL_RATE_SHARPSHOOTER = 0.4;
const GOAL_RATE_CLINICAL = 0.3;
const STREAK_MACHINE = 40;
const STREAK_HOT = 25;
const SPEED_HIGH_TEMPO = 5.0;
const BALLS_HIGH_VOLUME = 200;
const EXERCISES_WELL_ROUNDED = 10;

/**
 * Auto-generate quality tags for a training session based on its metrics.
 * These are rule-based labels that surface the highlights of a session.
 */
export function getSessionTags(session: TrainingSession): SessionTag[] {
  const tags: SessionTag[] = [];

  // High score
  if (session.score >= SCORE_ELITE) {
    tags.push({ emoji: '🏆', label: 'Elite Performance' });
  } else if (session.score >= SCORE_ON_FIRE) {
    tags.push({ emoji: '🔥', label: 'On Fire' });
  } else if (session.score >= SCORE_STRONG) {
    tags.push({ emoji: '💪', label: 'Strong Session' });
  }

  // High goal conversion (goals relative to balls)
  const goalRate = session.numberOfBalls > 0 ? session.numberOfGoals / session.numberOfBalls : 0;
  if (goalRate >= GOAL_RATE_SHARPSHOOTER) {
    tags.push({ emoji: '🎯', label: 'Sharpshooter' });
  } else if (goalRate >= GOAL_RATE_CLINICAL) {
    tags.push({ emoji: '⚽', label: 'Clinical Finisher' });
  }

  // High streak
  if (session.bestStreak >= STREAK_MACHINE) {
    tags.push({ emoji: '🔗', label: 'Streak Machine' });
  } else if (session.bestStreak >= STREAK_HOT) {
    tags.push({ emoji: '⚡', label: 'Hot Streak' });
  }

  // High tempo / speed of play
  if (session.avgSpeedOfPlay >= SPEED_HIGH_TEMPO) {
    tags.push({ emoji: '💨', label: 'High Tempo' });
  }

  // High volume
  if (session.numberOfBalls >= BALLS_HIGH_VOLUME) {
    tags.push({ emoji: '🏋️', label: 'High Volume' });
  }

  // Many exercises
  if (session.numberOfExercises >= EXERCISES_WELL_ROUNDED) {
    tags.push({ emoji: '📋', label: 'Well-Rounded' });
  }

  return tags;
}
