import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadData,
  findPlayerByEmail,
  findPlayerById,
  getSessionsForPlayer,
  getSessionById,
  getAppointmentsForPlayer,
  getPlayerSummary,
  getLeaderboard,
} from '../services/dataService';

// Load test data once before all tests
beforeAll(() => {
  loadData();
});

// ─── Player queries ──────────────────────────────────────

describe('findPlayerByEmail', () => {
  it('should return a player for a valid email', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();
    expect(player?.firstName).toBe('Sabrina');
    expect(player?.lastName).toBe('Williams');
  });

  it('should be case-insensitive', () => {
    const player = findPlayerByEmail('SABRINA.WILLIAMS@EXAMPLE.COM');
    expect(player).toBeDefined();
    expect(player?.email).toBe('sabrina.williams@example.com');
  });

  it('should return undefined for an unknown email', () => {
    const player = findPlayerByEmail('nobody@example.com');
    expect(player).toBeUndefined();
  });
});

describe('findPlayerById', () => {
  it('should return a player for a valid ID', () => {
    const byEmail = findPlayerByEmail('sabrina.williams@example.com');
    expect(byEmail).toBeDefined();

    const byId = findPlayerById(byEmail!.id);
    expect(byId).toBeDefined();
    expect(byId?.email).toBe('sabrina.williams@example.com');
  });

  it('should return undefined for an invalid ID', () => {
    expect(findPlayerById('nonexistent-id')).toBeUndefined();
  });
});

// ─── Training session queries ────────────────────────────

describe('getSessionsForPlayer', () => {
  it('should return sessions for a known player', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();

    const sessions = getSessionsForPlayer(player!.id, 'all');
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].playerId).toBe(player!.id);
  });

  it('should filter past sessions only', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();

    const pastSessions = getSessionsForPlayer(player!.id, 'past');
    const now = new Date();

    for (const session of pastSessions) {
      expect(new Date(session.startTime).getTime()).toBeLessThan(now.getTime());
    }
  });

  it('should sort sessions newest-first', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();

    const sessions = getSessionsForPlayer(player!.id, 'past');
    for (let i = 1; i < sessions.length; i++) {
      expect(new Date(sessions[i - 1].startTime).getTime()).toBeGreaterThanOrEqual(
        new Date(sessions[i].startTime).getTime(),
      );
    }
  });

  it('should return empty array for unknown player', () => {
    const sessions = getSessionsForPlayer('nonexistent-id', 'past');
    expect(sessions).toEqual([]);
  });
});

describe('getSessionById', () => {
  it('should return a session for a valid ID', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    const sessions = getSessionsForPlayer(player!.id, 'all');

    const session = getSessionById(sessions[0].id);
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessions[0].id);
  });

  it('should return undefined for an invalid ID', () => {
    expect(getSessionById('nonexistent-id')).toBeUndefined();
  });
});

// ─── Appointment queries ─────────────────────────────────

describe('getAppointmentsForPlayer', () => {
  it('should return appointments for a known player', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();

    const all = getAppointmentsForPlayer(player!.id, 'all');
    expect(all.length).toBeGreaterThan(0);
  });

  it('should sort appointments soonest-first', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    const appts = getAppointmentsForPlayer(player!.id, 'all');

    for (let i = 1; i < appts.length; i++) {
      expect(new Date(appts[i - 1].startTime).getTime()).toBeLessThanOrEqual(
        new Date(appts[i].startTime).getTime(),
      );
    }
  });

  it('should return empty array for unknown player', () => {
    expect(getAppointmentsForPlayer('nonexistent-id', 'all')).toEqual([]);
  });
});

// ─── Summary computation ─────────────────────────────────

describe('getPlayerSummary', () => {
  it('should compute correct summary for a known player', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    expect(player).toBeDefined();

    const summary = getPlayerSummary(player!.id);

    expect(summary.totalSessions).toBeGreaterThan(0);
    expect(summary.avgScore).toBeGreaterThan(0);
    expect(summary.bestStreakRecord).toBeGreaterThan(0);
    expect(summary.lastSession).not.toBeNull();
  });

  it('should return zero-valued summary for unknown player', () => {
    const summary = getPlayerSummary('nonexistent-id');
    expect(summary.totalSessions).toBe(0);
    expect(summary.avgScore).toBe(0);
    expect(summary.bestStreakRecord).toBe(0);
    expect(summary.lastSession).toBeNull();
  });

  it('should correctly calculate average score', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    const sessions = getSessionsForPlayer(player!.id, 'past');
    const summary = getPlayerSummary(player!.id);

    const manualAvg =
      Math.round(
        (sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length) * 10,
      ) / 10;

    expect(summary.avgScore).toBe(manualAvg);
  });

  it('should include last30Days stats', () => {
    const player = findPlayerByEmail('sabrina.williams@example.com');
    const summary = getPlayerSummary(player!.id);

    expect(summary.last30Days).toBeDefined();
    expect(typeof summary.last30Days.totalSessions).toBe('number');
    expect(typeof summary.last30Days.avgScore).toBe('number');
    expect(typeof summary.last30Days.totalGoals).toBe('number');
    expect(typeof summary.last30Days.totalBalls).toBe('number');
  });
});

// ─── Leaderboard computation ─────────────────────────────

describe('getLeaderboard', () => {
  it('should return entries for all players', () => {
    const leaderboard = getLeaderboard();
    expect(leaderboard.length).toBe(3); // 3 demo players
  });

  it('should have sequential ranks starting at 1', () => {
    const leaderboard = getLeaderboard();
    leaderboard.forEach((entry, idx) => {
      expect(entry.rank).toBe(idx + 1);
    });
  });

  it('should be sorted by avgScore descending', () => {
    const leaderboard = getLeaderboard();
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].avgScore).toBeGreaterThanOrEqual(leaderboard[i].avgScore);
    }
  });

  it('should have valid fields for each entry', () => {
    const leaderboard = getLeaderboard();
    for (const entry of leaderboard) {
      expect(entry.playerId).toBeTruthy();
      expect(entry.firstName).toBeTruthy();
      expect(entry.lastName).toBeTruthy();
      expect(entry.centerName).toBeTruthy();
      expect(typeof entry.totalSessions).toBe('number');
      expect(typeof entry.avgScore).toBe('number');
      expect(typeof entry.totalGoals).toBe('number');
      expect(typeof entry.bestStreak).toBe('number');
      expect(typeof entry.totalBalls).toBe('number');
      expect(typeof entry.avgSpeedOfPlay).toBe('number');
    }
  });
});
