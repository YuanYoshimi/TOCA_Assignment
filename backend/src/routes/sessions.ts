import { Router } from 'express';
import { z } from 'zod';
import { getSessionById } from '../services/dataService';

const router = Router();

const sessionIdSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
});

// ─── GET /api/training-sessions/:sessionId ───────────────

router.get('/:sessionId', (req, res) => {
  const paramsParsed = sessionIdSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  const session = getSessionById(paramsParsed.data.sessionId);
  if (!session) {
    res.status(404).json({ error: 'Training session not found' });
    return;
  }

  res.json(session);
});

export default router;
