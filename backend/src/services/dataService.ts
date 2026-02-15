import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Profile, TrainingSession, Appointment, PlayerSummary, LeaderboardEntry, TrainerSchedule, TimeSlot } from '../models/types';

/**
 * In-memory data store. JSON files are read once on startup and cached.
 * For a take-home this is acceptable; in production you'd use a database.
 */
let profiles: Profile[] = [];
let trainingSessions: TrainingSession[] = [];
let appointments: Appointment[] = [];

const DATA_DIR = path.resolve(__dirname, '../../../data');

function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

/** Load all JSON data into memory. Call once on startup. */
export function loadData(): void {
  try {
    profiles = readJsonFile<Profile>('profiles.json');
    trainingSessions = readJsonFile<TrainingSession>('trainingSessions.json');
    appointments = readJsonFile<Appointment>('appointments.json');
    console.log(
      `[DataService] Loaded ${profiles.length} profiles, ${trainingSessions.length} sessions, ${appointments.length} appointments`,
    );
  } catch (err) {
    console.error('[DataService] Failed to load data files:', err);
    throw new Error('Failed to load data files. Ensure /data directory exists with valid JSON.');
  }
}

/** Reload data (useful during dev) */
export function reloadData(): void {
  loadData();
}

// ─── Player queries ──────────────────────────────────────

export function findPlayerByEmail(email: string): Profile | undefined {
  return profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function findPlayerById(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

// ─── Training session queries ────────────────────────────

export function getSessionsForPlayer(
  playerId: string,
  filter: 'past' | 'all' = 'past',
): TrainingSession[] {
  const now = new Date();
  let sessions = trainingSessions.filter((s) => s.playerId === playerId);

  if (filter === 'past') {
    sessions = sessions.filter((s) => new Date(s.startTime) < now);
  }

  // Sort newest first
  sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  return sessions;
}

export function getSessionById(sessionId: string): TrainingSession | undefined {
  return trainingSessions.find((s) => s.id === sessionId);
}

// ─── Appointment queries ─────────────────────────────────

export function getAppointmentsForPlayer(
  playerId: string,
  filter: 'future' | 'all' = 'future',
): Appointment[] {
  const now = new Date();
  let appts = appointments.filter((a) => a.playerId === playerId);

  if (filter === 'future') {
    appts = appts.filter((a) => new Date(a.startTime) > now);
  }

  // Sort soonest first
  appts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return appts;
}

/** Create a new appointment and add it to the in-memory store */
export function createAppointment(
  playerId: string,
  trainerName: string,
  startTime: string,
  endTime: string,
): Appointment {
  const appointment: Appointment = {
    id: randomUUID(),
    playerId,
    trainerName,
    startTime,
    endTime,
  };
  appointments.push(appointment);
  return appointment;
}

/** Cancel (delete) an appointment by ID. Returns true if found and removed. */
export function cancelAppointment(appointmentId: string): boolean {
  const idx = appointments.findIndex((a) => a.id === appointmentId);
  if (idx === -1) return false;
  appointments.splice(idx, 1);
  return true;
}

/** Get unique trainer names from all sessions and appointments */
export function getTrainers(): string[] {
  const trainerSet = new Set<string>();
  trainingSessions.forEach((s) => trainerSet.add(s.trainerName));
  appointments.forEach((a) => trainerSet.add(a.trainerName));
  return [...trainerSet].sort();
}

// ─── Summary computation ─────────────────────────────────

export function getPlayerSummary(playerId: string): PlayerSummary {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const allSessions = trainingSessions
    .filter((s) => s.playerId === playerId && new Date(s.startTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const totalSessions = allSessions.length;

  const avgScore =
    totalSessions > 0
      ? Math.round((allSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions) * 10) / 10
      : 0;

  const bestStreakRecord =
    totalSessions > 0 ? Math.max(...allSessions.map((s) => s.bestStreak)) : 0;

  const lastSession =
    allSessions.length > 0
      ? {
          id: allSessions[0].id,
          date: allSessions[0].startTime,
          score: allSessions[0].score,
          trainerName: allSessions[0].trainerName,
        }
      : null;

  // Last 30 days stats
  const recentSessions = allSessions.filter((s) => new Date(s.startTime) >= thirtyDaysAgo);
  const last30Days = {
    totalSessions: recentSessions.length,
    totalBalls: recentSessions.reduce((sum, s) => sum + s.numberOfBalls, 0),
    avgScore:
      recentSessions.length > 0
        ? Math.round(
            (recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length) * 10,
          ) / 10
        : 0,
    totalGoals: recentSessions.reduce((sum, s) => sum + s.numberOfGoals, 0),
  };

  return { totalSessions, avgScore, bestStreakRecord, lastSession, last30Days };
}

// ─── Schedule / availability ─────────────────────────────

/** Operating hours: 9 AM to 5 PM, 1-hour slots */
const SCHEDULE_START_HOUR = 9;
const SCHEDULE_END_HOUR = 17;

/**
 * Get a trainer's schedule for a given date.
 * Generates 1-hour slots from 9 AM to 5 PM and marks
 * any slot that overlaps with an existing appointment as unavailable.
 */
export function getTrainerSchedule(trainerName: string, date: string): TrainerSchedule {
  const slots: TimeSlot[] = [];
  const now = new Date();

  for (let hour = SCHEDULE_START_HOUR; hour < SCHEDULE_END_HOUR; hour++) {
    const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
    const end = new Date(`${date}T${String(hour + 1).padStart(2, '0')}:00:00`);

    // Slot is in the past → not available
    const isPast = start <= now;

    // Check if this slot conflicts with any existing appointment for this trainer
    const isBooked = appointments.some((a) => {
      if (a.trainerName !== trainerName) return false;
      const aStart = new Date(a.startTime);
      const aEnd = new Date(a.endTime);
      // Overlaps if appointment starts before slot ends AND ends after slot starts
      return aStart < end && aEnd > start;
    });

    slots.push({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      available: !isBooked && !isPast,
    });
  }

  return { trainerName, date, slots };
}

/**
 * Get schedules for all trainers on a given date.
 */
export function getAllTrainerSchedules(date: string): TrainerSchedule[] {
  const trainerNames = getTrainers();
  return trainerNames.map((name) => getTrainerSchedule(name, date));
}

// ─── Leaderboard computation ─────────────────────────────

export function getLeaderboard(): LeaderboardEntry[] {
  const now = new Date();

  const entries: LeaderboardEntry[] = profiles.map((p) => {
    const pastSessions = trainingSessions.filter(
      (s) => s.playerId === p.id && new Date(s.startTime) < now,
    );

    const totalSessions = pastSessions.length;
    const totalGoals = pastSessions.reduce((sum, s) => sum + s.numberOfGoals, 0);
    const totalBalls = pastSessions.reduce((sum, s) => sum + s.numberOfBalls, 0);
    const bestStreak = totalSessions > 0 ? Math.max(...pastSessions.map((s) => s.bestStreak)) : 0;
    const avgScore =
      totalSessions > 0
        ? Math.round((pastSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions) * 10) / 10
        : 0;
    const avgSpeedOfPlay =
      totalSessions > 0
        ? Math.round(
            (pastSessions.reduce((sum, s) => sum + s.avgSpeedOfPlay, 0) / totalSessions) * 100,
          ) / 100
        : 0;

    return {
      rank: 0, // filled below
      playerId: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      centerName: p.centerName,
      totalSessions,
      avgScore,
      totalGoals,
      bestStreak,
      totalBalls,
      avgSpeedOfPlay,
    };
  });

  // Sort by avgScore descending, then totalGoals descending as tiebreaker
  entries.sort((a, b) => b.avgScore - a.avgScore || b.totalGoals - a.totalGoals);

  // Assign ranks
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
