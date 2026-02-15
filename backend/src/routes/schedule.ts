import { Router } from 'express';
import { z } from 'zod';
import { getTrainerSchedule, getAllTrainerSchedules } from '../services/dataService';

const router = Router();

const scheduleQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  trainerName: z.string().min(1).optional(),
});

// ─── GET /api/schedule?date=YYYY-MM-DD&trainerName=... ───

router.get('/', (req, res) => {
  const parsed = scheduleQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
    return;
  }

  const { date, trainerName } = parsed.data;

  if (trainerName) {
    const schedule = getTrainerSchedule(trainerName, date);
    res.json([schedule]);
  } else {
    const schedules = getAllTrainerSchedules(date);
    res.json(schedules);
  }
});

export default router;
