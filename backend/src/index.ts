import express from 'express';
import cors from 'cors';
import { loadData } from './services/dataService';
import { errorHandler } from './middleware/errorHandler';
import playersRouter from './routes/players';
import sessionsRouter from './routes/sessions';
import scheduleRouter from './routes/schedule';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ──────────────────────────────────────────
app.use('/api/players', playersRouter);
app.use('/api/training-sessions', sessionsRouter);
app.use('/api/schedule', scheduleRouter);

// ─── Error handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────
try {
  loadData();
  app.listen(PORT, () => {
    console.log(`[Server] TOCA API running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
}
