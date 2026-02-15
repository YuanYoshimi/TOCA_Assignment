import { describe, it, expect } from 'vitest';
import { getSessionTags } from '@/lib/sessionTags';
import type { TrainingSession } from '@/types/models';

function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 'test-session-1',
    playerId: 'test-player-1',
    startTime: '2026-01-15T18:00:00Z',
    endTime: '2026-01-15T19:00:00Z',
    score: 75,
    numberOfGoals: 20,
    bestStreak: 10,
    avgSpeedOfPlay: 3.5,
    numberOfBalls: 100,
    numberOfExercises: 5,
    trainerName: 'Coach Test',
    ...overrides,
  };
}

describe('getSessionTags', () => {
  it('should return empty array for an average session', () => {
    const tags = getSessionTags(makeSession());
    expect(tags).toEqual([]);
  });

  it('should tag Elite Performance for score >= 95', () => {
    const tags = getSessionTags(makeSession({ score: 96 }));
    expect(tags.some((t) => t.label === 'Elite Performance')).toBe(true);
  });

  it('should tag On Fire for score >= 90 but < 95', () => {
    const tags = getSessionTags(makeSession({ score: 92 }));
    expect(tags.some((t) => t.label === 'On Fire')).toBe(true);
    expect(tags.some((t) => t.label === 'Elite Performance')).toBe(false);
  });

  it('should tag Strong Session for score >= 80 but < 90', () => {
    const tags = getSessionTags(makeSession({ score: 85 }));
    expect(tags.some((t) => t.label === 'Strong Session')).toBe(true);
  });

  it('should tag Sharpshooter for goal rate >= 0.4', () => {
    const tags = getSessionTags(makeSession({ numberOfGoals: 50, numberOfBalls: 100 }));
    expect(tags.some((t) => t.label === 'Sharpshooter')).toBe(true);
  });

  it('should tag Clinical Finisher for goal rate >= 0.3 but < 0.4', () => {
    const tags = getSessionTags(makeSession({ numberOfGoals: 35, numberOfBalls: 100 }));
    expect(tags.some((t) => t.label === 'Clinical Finisher')).toBe(true);
    expect(tags.some((t) => t.label === 'Sharpshooter')).toBe(false);
  });

  it('should tag Streak Machine for bestStreak >= 40', () => {
    const tags = getSessionTags(makeSession({ bestStreak: 42 }));
    expect(tags.some((t) => t.label === 'Streak Machine')).toBe(true);
  });

  it('should tag Hot Streak for bestStreak >= 25 but < 40', () => {
    const tags = getSessionTags(makeSession({ bestStreak: 30 }));
    expect(tags.some((t) => t.label === 'Hot Streak')).toBe(true);
    expect(tags.some((t) => t.label === 'Streak Machine')).toBe(false);
  });

  it('should tag High Tempo for avgSpeedOfPlay >= 5.0', () => {
    const tags = getSessionTags(makeSession({ avgSpeedOfPlay: 5.5 }));
    expect(tags.some((t) => t.label === 'High Tempo')).toBe(true);
  });

  it('should tag High Volume for numberOfBalls >= 200', () => {
    const tags = getSessionTags(makeSession({ numberOfBalls: 220 }));
    expect(tags.some((t) => t.label === 'High Volume')).toBe(true);
  });

  it('should tag Well-Rounded for numberOfExercises >= 10', () => {
    const tags = getSessionTags(makeSession({ numberOfExercises: 12 }));
    expect(tags.some((t) => t.label === 'Well-Rounded')).toBe(true);
  });

  it('should return multiple tags for an exceptional session', () => {
    const tags = getSessionTags(
      makeSession({
        score: 97,
        numberOfGoals: 80,
        numberOfBalls: 200,
        bestStreak: 45,
        avgSpeedOfPlay: 6.0,
        numberOfExercises: 10,
      }),
    );
    expect(tags.length).toBeGreaterThanOrEqual(4);
    expect(tags.some((t) => t.label === 'Elite Performance')).toBe(true);
    expect(tags.some((t) => t.label === 'Sharpshooter')).toBe(true);
    expect(tags.some((t) => t.label === 'Streak Machine')).toBe(true);
  });
});
