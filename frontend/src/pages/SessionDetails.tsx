import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  Zap,
  CircleDot,
  Dumbbell,
  Clock,
  User,
  ArrowUp,
  ArrowDown,
  Minus,
  GitCompareArrows,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getTrainingSession, getPlayerSummary, getTrainingSessions } from '@/services/api';
import type { TrainingSession } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatDateTimeRange } from '@/lib/utils';
import { getSessionTags } from '@/lib/sessionTags';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/PageTransition';

export default function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { player } = useAuth();
  const navigate = useNavigate();

  const playerId = player?.id ?? '';

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getTrainingSession(sessionId ?? ''),
    enabled: !!sessionId,
  });

  const summaryQuery = useQuery({
    queryKey: ['player', playerId, 'summary'],
    queryFn: () => getPlayerSummary(playerId),
    enabled: !!playerId,
  });

  // Fetch all past sessions to find the previous one for comparison
  const allSessionsQuery = useQuery({
    queryKey: ['player', playerId, 'sessions', 'past'],
    queryFn: () => getTrainingSessions(playerId, 'past'),
    enabled: !!playerId,
  });

  const session = sessionQuery.data;
  const avgScore = summaryQuery.data?.avgScore ?? 0;
  const allSessions = allSessionsQuery.data ?? [];

  // Find the previous session (sessions are sorted newest-first)
  const previousSession = (() => {
    if (!session || allSessions.length < 2) return null;
    const idx = allSessions.findIndex((s) => s.id === session.id);
    if (idx === -1 || idx >= allSessions.length - 1) return null;
    return allSessions[idx + 1];
  })();

  function getPerformanceLabel(score: number, avg: number): { label: string; variant: 'success' | 'warning' | 'secondary' } {
    if (avg === 0) return { label: 'N/A', variant: 'secondary' };
    const diff = score - avg;
    if (diff > 5) return { label: 'Above average', variant: 'success' };
    if (diff < -5) return { label: 'Below average', variant: 'warning' };
    return { label: 'Near average', variant: 'secondary' };
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (sessionQuery.isError || !session) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="py-12 text-center text-muted-foreground">
          <p>Session not found. It may have been removed.</p>
        </div>
      </div>
    );
  }

  const perf = getPerformanceLabel(session.score, avgScore);
  const tags = getSessionTags(session);

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/home')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Session Details</h1>
          <p className="mt-1 text-muted-foreground">
            {formatDateTimeRange(session.startTime, session.endTime)}
          </p>
        </div>
        <Badge variant={perf.variant} className="mt-10 text-sm">
          {perf.label}
        </Badge>
      </div>

      {/* Quality tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.label} variant="outline" className="gap-1 text-xs">
              <span>{tag.emoji}</span>
              {tag.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Trainer info */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{session.trainerName}</p>
            <p className="text-xs text-muted-foreground">Trainer</p>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={<Trophy className="h-5 w-5 text-primary" />}
          label="Score"
          value={session.score}
          detail={avgScore > 0 ? `Avg: ${avgScore}` : undefined}
        />
        <MetricCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="Goals"
          value={session.numberOfGoals}
        />
        <MetricCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Best Streak"
          value={session.bestStreak}
        />
        <MetricCard
          icon={<Zap className="h-5 w-5 text-yellow-500" />}
          label="Avg Speed of Play"
          value={`${session.avgSpeedOfPlay.toFixed(1)}s`}
        />
        <MetricCard
          icon={<CircleDot className="h-5 w-5 text-blue-500" />}
          label="Balls Played"
          value={session.numberOfBalls}
        />
        <MetricCard
          icon={<Dumbbell className="h-5 w-5 text-purple-500" />}
          label="Exercises"
          value={session.numberOfExercises}
        />
      </div>

      {/* Session comparison vs previous */}
      {previousSession && (
        <>
          <Separator />
          <ComparisonCard current={session} previous={previousSession} />
        </>
      )}

      {/* Score comparison vs average */}
      {avgScore > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Performance Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Session score</span>
                    <span className="font-semibold">{session.score}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(session.score, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Your average</span>
                    <span className="font-semibold">{avgScore}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-muted-foreground/30 transition-all"
                      style={{ width: `${Math.min(avgScore, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {session.score > avgScore
                  ? `Great work! You scored ${(session.score - avgScore).toFixed(1)} points above your average.`
                  : session.score < avgScore
                    ? `You were ${(avgScore - session.score).toFixed(1)} points below your average. Keep pushing — consistency is key!`
                    : 'Right at your average. Solid and consistent!'}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </PageTransition>
  );
}

// ─── Session Comparison Card ─────────────────────────────

function ComparisonCard({
  current,
  previous,
}: {
  current: TrainingSession;
  previous: TrainingSession;
}) {
  const metrics: {
    label: string;
    currentVal: number;
    previousVal: number;
    suffix?: string;
    higherIsBetter: boolean;
  }[] = [
    { label: 'Score', currentVal: current.score, previousVal: previous.score, higherIsBetter: true },
    { label: 'Goals', currentVal: current.numberOfGoals, previousVal: previous.numberOfGoals, higherIsBetter: true },
    { label: 'Best Streak', currentVal: current.bestStreak, previousVal: previous.bestStreak, higherIsBetter: true },
    { label: 'Avg Speed', currentVal: current.avgSpeedOfPlay, previousVal: previous.avgSpeedOfPlay, suffix: 's', higherIsBetter: true },
    { label: 'Balls', currentVal: current.numberOfBalls, previousVal: previous.numberOfBalls, higherIsBetter: true },
    { label: 'Exercises', currentVal: current.numberOfExercises, previousVal: previous.numberOfExercises, higherIsBetter: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          vs Previous Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const diff = m.currentVal - m.previousVal;
            const isPositive = m.higherIsBetter ? diff > 0 : diff < 0;
            const isNeutral = diff === 0;

            return (
              <div key={m.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-semibold">
                    {m.currentVal % 1 !== 0 ? m.currentVal.toFixed(1) : m.currentVal}
                    {m.suffix ?? ''}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    isNeutral
                      ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      : isPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                  )}
                >
                  {isNeutral ? (
                    <Minus className="h-3 w-3" />
                  ) : diff > 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {isNeutral
                    ? '0'
                    : `${diff > 0 ? '+' : ''}${diff % 1 !== 0 ? diff.toFixed(1) : diff}${m.suffix ?? ''}`}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Compared to session on {new Date(previous.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} with {previous.trainerName}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Metric Card ─────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {detail && <p className="text-xs text-muted-foreground/70">{detail}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
