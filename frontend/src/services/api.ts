import type { Profile, TrainingSession, Appointment, PlayerSummary, LeaderboardEntry, TrainerSchedule } from '@/types/models';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ApiError {
  error?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Look up a player by email */
export function getPlayerByEmail(email: string): Promise<Profile> {
  return fetchJson<Profile>(`/api/players/by-email?email=${encodeURIComponent(email)}`);
}

/** Get computed dashboard summary for a player */
export function getPlayerSummary(playerId: string): Promise<PlayerSummary> {
  return fetchJson<PlayerSummary>(`/api/players/${playerId}/summary`);
}

/** Get training sessions for a player (past by default) */
export function getTrainingSessions(
  playerId: string,
  filter: 'past' | 'all' = 'past',
): Promise<TrainingSession[]> {
  return fetchJson<TrainingSession[]>(
    `/api/players/${playerId}/training-sessions?filter=${filter}`,
  );
}

/** Get a single training session by id */
export function getTrainingSession(sessionId: string): Promise<TrainingSession> {
  return fetchJson<TrainingSession>(`/api/training-sessions/${sessionId}`);
}

/** Get the leaderboard of all players */
export function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchJson<LeaderboardEntry[]>('/api/players/leaderboard');
}

/** Get appointments for a player (future by default) */
export function getAppointments(
  playerId: string,
  filter: 'future' | 'all' = 'future',
): Promise<Appointment[]> {
  return fetchJson<Appointment[]>(`/api/players/${playerId}/appointments?filter=${filter}`);
}

/** Book a new appointment */
export function bookAppointment(
  playerId: string,
  data: { trainerName: string; startTime: string; endTime: string },
): Promise<Appointment> {
  return fetchJson<Appointment>(`/api/players/${playerId}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Cancel an appointment */
export function cancelAppointment(playerId: string, appointmentId: string): Promise<void> {
  return fetchJson<void>(`/api/players/${playerId}/appointments/${appointmentId}`, {
    method: 'DELETE',
  });
}

/** Get list of available trainer names */
export function getTrainers(): Promise<string[]> {
  return fetchJson<string[]>('/api/players/trainers');
}

/** Get trainer schedules for a date (all trainers or a specific one) */
export function getSchedule(
  date: string,
  trainerName?: string,
): Promise<TrainerSchedule[]> {
  const params = new URLSearchParams({ date });
  if (trainerName) params.set('trainerName', trainerName);
  return fetchJson<TrainerSchedule[]>(`/api/schedule?${params.toString()}`);
}
