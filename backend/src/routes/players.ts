import { Router } from 'express';
import { z } from 'zod';
import {
  findPlayerByEmail,
  findPlayerById,
  getPlayerSummary,
  getSessionsForPlayer,
  getAppointmentsForPlayer,
  getLeaderboard,
  createAppointment,
  cancelAppointment,
  getTrainers,
} from '../services/dataService';

const router = Router();

// ─── Validation schemas ───────────────────────────────────

const emailQuerySchema = z.object({
  email: z.string().email('Invalid email format'),
});

const playerIdSchema = z.object({
  playerId: z.string().uuid('Invalid player ID format'),
});

const sessionFilterSchema = z.object({
  filter: z.enum(['past', 'all']).default('past'),
});

const appointmentFilterSchema = z.object({
  filter: z.enum(['future', 'all']).default('future'),
});

const createAppointmentSchema = z.object({
  trainerName: z.string().min(1, 'Trainer name is required'),
  startTime: z.string().datetime('Invalid start time (ISO 8601 expected)'),
  endTime: z.string().datetime('Invalid end time (ISO 8601 expected)'),
});

const appointmentIdSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID format'),
});

// ─── GET /api/players/leaderboard ─────────────────────────

router.get('/leaderboard', (_req, res) => {
  const leaderboard = getLeaderboard();
  res.json(leaderboard);
});

// ─── GET /api/players/trainers ────────────────────────────

router.get('/trainers', (_req, res) => {
  res.json(getTrainers());
});

// ─── GET /api/players/by-email?email=... ─────────────────

router.get('/by-email', (req, res) => {
  const parsed = emailQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email', details: parsed.error.flatten() });
    return;
  }

  const player = findPlayerByEmail(parsed.data.email);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  res.json(player);
});

// ─── GET /api/players/:playerId/summary ──────────────────

router.get('/:playerId/summary', (req, res) => {
  const paramsParsed = playerIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid player ID' });
    return;
  }

  const { playerId } = paramsParsed.data;
  const player = findPlayerById(playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const summary = getPlayerSummary(playerId);
  res.json(summary);
});

// ─── GET /api/players/:playerId/training-sessions ────────

router.get('/:playerId/training-sessions', (req, res) => {
  const paramsParsed = playerIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid player ID' });
    return;
  }

  const { playerId } = paramsParsed.data;
  const player = findPlayerById(playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const parsed = sessionFilterSchema.safeParse(req.query);
  const filter = parsed.success ? parsed.data.filter : 'past';

  const sessions = getSessionsForPlayer(playerId, filter);
  res.json(sessions);
});

// ─── GET /api/players/:playerId/appointments ─────────────

router.get('/:playerId/appointments', (req, res) => {
  const paramsParsed = playerIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid player ID' });
    return;
  }

  const { playerId } = paramsParsed.data;
  const player = findPlayerById(playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const parsed = appointmentFilterSchema.safeParse(req.query);
  const filter = parsed.success ? parsed.data.filter : 'future';

  const appts = getAppointmentsForPlayer(playerId, filter);
  res.json(appts);
});

// ─── POST /api/players/:playerId/appointments ────────────

router.post('/:playerId/appointments', (req, res) => {
  const paramsParsed = playerIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid player ID' });
    return;
  }

  const { playerId } = paramsParsed.data;
  const player = findPlayerById(playerId);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const bodyParsed = createAppointmentSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: 'Invalid appointment data', details: bodyParsed.error.flatten() });
    return;
  }

  const { trainerName, startTime, endTime } = bodyParsed.data;

  // Validate that end time is after start time
  if (new Date(endTime) <= new Date(startTime)) {
    res.status(400).json({ error: 'End time must be after start time' });
    return;
  }

  // Validate that start time is in the future
  if (new Date(startTime) <= new Date()) {
    res.status(400).json({ error: 'Appointment must be in the future' });
    return;
  }

  const appointment = createAppointment(playerId, trainerName, startTime, endTime);
  res.status(201).json(appointment);
});

// ─── DELETE /api/players/:playerId/appointments/:appointmentId

router.delete('/:playerId/appointments/:appointmentId', (req, res) => {
  const paramsParsed = playerIdSchema.safeParse({ playerId: req.params.playerId });
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid player ID' });
    return;
  }

  const apptParsed = appointmentIdSchema.safeParse({ appointmentId: req.params.appointmentId });
  if (!apptParsed.success) {
    res.status(400).json({ error: 'Invalid appointment ID' });
    return;
  }

  const deleted = cancelAppointment(apptParsed.data.appointmentId);
  if (!deleted) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  res.status(204).send();
});

export default router;
