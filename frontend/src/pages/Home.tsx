import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  Download,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPlayerSummary, getTrainingSessions, getAppointments, cancelAppointment } from '@/services/api';
import type { TrainingSession } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime, formatDateTimeRange } from '@/lib/utils';
import { ScoreChart } from '@/components/ScoreChart';
import { Leaderboard } from '@/components/Leaderboard';
import { GoalTracker } from '@/components/GoalTracker';
import { SessionFiltersBar } from '@/components/SessionFilters';
import { BookAppointment } from '@/components/BookAppointment';
import { PageTransition } from '@/components/PageTransition';
import { getSessionTags } from '@/lib/sessionTags';
import { exportSessionsCsv } from '@/lib/exportCsv';

export default function Home() {
  const { player } = useAuth();
  const navigate = useNavigate();

  // Filtered sessions (set by SessionFiltersBar)
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  const handleFiltered = useCallback((filtered: TrainingSession[]) => {
    setFilteredSessions(filtered);
  }, []);

  if (!player) return null;

  const playerId = player.id;

  const summaryQuery = useQuery({
    queryKey: ['player', playerId, 'summary'],
    queryFn: () => getPlayerSummary(playerId),
  });

  const sessionsQuery = useQuery({
    queryKey: ['player', playerId, 'sessions', 'past'],
    queryFn: () => getTrainingSessions(playerId, 'past'),
  });

  const appointmentsQuery = useQuery({
    queryKey: ['player', playerId, 'appointments', 'future'],
    queryFn: () => getAppointments(playerId, 'future'),
  });

  const summary = summaryQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const appointments = appointmentsQuery.data ?? [];

  // Show error state if any critical query fails
  const hasError = summaryQuery.isError || sessionsQuery.isError || appointmentsQuery.isError;
  if (hasError) {
    return (
      <div className="py-12 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-lg font-medium">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load your training data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {player.firstName}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your training overview and upcoming schedule.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : summary ? (
            <>
              <SummaryCard
                title="Last Session Score"
                value={summary.lastSession?.score ?? '—'}
                subtitle={summary.lastSession ? `with ${summary.lastSession.trainerName}` : 'No sessions yet'}
                icon={<Trophy className="h-4 w-4 text-primary" />}
              />
              <SummaryCard
                title="Average Score"
                value={summary.avgScore}
                subtitle={`Across ${summary.totalSessions} sessions`}
                icon={<Target className="h-4 w-4 text-primary" />}
              />
              <SummaryCard
                title="Best Streak"
                value={summary.bestStreakRecord}
                subtitle="Personal record"
                icon={<Flame className="h-4 w-4 text-orange-500" />}
              />
              <SummaryCard
                title="Total Sessions"
                value={summary.totalSessions}
                subtitle={`${summary.last30Days.totalSessions} in last 30 days`}
                icon={<Calendar className="h-4 w-4 text-primary" />}
              />
            </>
          ) : null}
        </div>

        {/* Goal tracker */}
        {summary && (
          <GoalTracker playerId={playerId} currentAvgScore={summary.avgScore} />
        )}

        {/* Last 30 days highlight */}
        {summary && summary.last30Days.totalSessions > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MiniStat label="Sessions" value={summary.last30Days.totalSessions} />
                <MiniStat label="Avg Score" value={summary.last30Days.avgScore} />
                <MiniStat label="Total Goals" value={summary.last30Days.totalGoals} />
                <MiniStat label="Total Balls" value={summary.last30Days.totalBalls} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score progress chart */}
        {sessions.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Score Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreChart sessions={sessions} avgScore={summary?.avgScore ?? 0} />
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Leaderboard />

        {/* Past sessions + upcoming appointments */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Past sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Past Training Sessions</CardTitle>
                {sessions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() =>
                      exportSessionsCsv(sessions, `${player.firstName}-${player.lastName}`)
                    }
                    aria-label="Export training sessions as CSV"
                  >
                    <Download className="h-3 w-3" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sessionsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p>No past sessions yet.</p>
                  <p>Book a training session to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Filters */}
                  <SessionFiltersBar sessions={sessions} onFiltered={handleFiltered} />

                  {/* Session list */}
                  <div className="space-y-2">
                    {filteredSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {formatDate(session.startTime)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              Score: {session.score}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {session.trainerName} • {formatTime(session.startTime)} – {formatTime(session.endTime)}
                          </p>
                          {(() => {
                            const tags = getSessionTags(session);
                            if (tags.length === 0) return null;
                            return (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {tags.slice(0, 2).map((tag) => (
                                  <span key={tag.label} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                    {tag.emoji} {tag.label}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                    {filteredSessions.length === 0 && sessions.length > 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No sessions match your filters.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <AppointmentsCard
            playerId={playerId}
            appointments={appointments}
            isLoading={appointmentsQuery.isLoading}
          />
        </div>
      </div>
    </PageTransition>
  );
}

// ─── Sub-components ──────────────────────────────────────

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AppointmentsCard({
  playerId,
  appointments,
  isLoading,
}: {
  playerId: string;
  appointments: { id: string; startTime: string; endTime: string; trainerName: string }[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(playerId, appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId, 'appointments'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
          <BookAppointment />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p>No upcoming appointments.</p>
            <p>Book a session to keep improving!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="group flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{formatDateTimeRange(appt.startTime, appt.endTime)}</p>
                  <p className="text-xs text-muted-foreground">{appt.trainerName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => cancelMutation.mutate(appt.id)}
                  disabled={cancelMutation.isPending}
                  aria-label="Cancel appointment"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
