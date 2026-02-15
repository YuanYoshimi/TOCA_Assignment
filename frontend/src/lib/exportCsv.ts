import type { TrainingSession } from '@/types/models';

/**
 * Convert an array of training sessions to a CSV string and trigger a download.
 */
export function exportSessionsCsv(
  sessions: TrainingSession[],
  playerName: string,
): void {
  const headers = [
    'Date',
    'Trainer',
    'Score',
    'Goals',
    'Best Streak',
    'Avg Speed of Play',
    'Balls Played',
    'Exercises',
    'Start Time',
    'End Time',
  ];

  const rows = sessions.map((s) => [
    new Date(s.startTime).toLocaleDateString(),
    s.trainerName,
    s.score.toString(),
    s.numberOfGoals.toString(),
    s.bestStreak.toString(),
    s.avgSpeedOfPlay.toFixed(2),
    s.numberOfBalls.toString(),
    s.numberOfExercises.toString(),
    new Date(s.startTime).toISOString(),
    new Date(s.endTime).toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `toca-training-history-${playerName.replace(/\s+/g, '-').toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
