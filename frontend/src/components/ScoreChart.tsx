import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { TrainingSession } from '@/types/models';
import { useTheme } from '@/context/ThemeContext';

interface ScoreChartProps {
  sessions: TrainingSession[];
  avgScore: number;
}

export function ScoreChart({ sessions, avgScore }: ScoreChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#27272a' : '#e4e4e7';
  const axisColor = isDark ? '#a1a1aa' : '#71717a';
  const primaryColor = isDark ? '#14b8a6' : '#0d9488';
  const tooltipBg = isDark ? '#18181b' : '#ffffff';
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7';

  // Sessions come newest-first; reverse for chronological chart
  const data = [...sessions]
    .reverse()
    .map((s) => ({
      date: format(parseISO(s.startTime), 'MMM d'),
      score: s.score,
      goals: s.numberOfGoals,
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={axisColor} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke={axisColor} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${tooltipBorder}`,
              fontSize: '13px',
              backgroundColor: tooltipBg,
              color: isDark ? '#fafafa' : '#0a0a0a',
            }}
          />
          {avgScore > 0 && (
            <ReferenceLine
              y={avgScore}
              stroke={primaryColor}
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${avgScore}`,
                position: 'right',
                fill: primaryColor,
                fontSize: 11,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="score"
            stroke={primaryColor}
            strokeWidth={2}
            dot={{ r: 4, fill: primaryColor }}
            activeDot={{ r: 6 }}
            name="Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
