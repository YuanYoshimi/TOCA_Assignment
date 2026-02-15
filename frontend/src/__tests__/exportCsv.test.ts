import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSessionsCsv } from '@/lib/exportCsv';
import type { TrainingSession } from '@/types/models';

function makeSession(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 'test-1',
    playerId: 'player-1',
    startTime: '2026-01-15T18:00:00Z',
    endTime: '2026-01-15T19:00:00Z',
    score: 85.5,
    numberOfGoals: 25,
    bestStreak: 15,
    avgSpeedOfPlay: 4.2,
    numberOfBalls: 150,
    numberOfExercises: 8,
    trainerName: 'Coach Test',
    ...overrides,
  };
}

describe('exportSessionsCsv', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.fn>;
  let removeChildSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { click: clickSpy, href: '', download: '' } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    });

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('should trigger a download when called with sessions', () => {
    const sessions = [makeSession(), makeSession({ id: 'test-2', score: 92.3 })];
    exportSessionsCsv(sessions, 'Test Player');

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('should generate a properly named file', () => {
    const sessions = [makeSession()];
    exportSessionsCsv(sessions, 'Test Player');

    const link = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe('toca-training-history-test-player.csv');
  });
});
