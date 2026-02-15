import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Crown,
  Medal,
  Award,
  Target,
  Flame,
  CircleDot,
  Zap,
  ChevronDown,
  Dumbbell,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { getLeaderboard } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { LeaderboardEntry } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

function rankBadgeVariant(rank: number): 'default' | 'secondary' | 'outline' {
  if (rank === 1) return 'default';
  if (rank <= 3) return 'secondary';
  return 'outline';
}

export function Leaderboard() {
  const { player } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  const currentPlayerEntry = leaderboard?.find((e) => e.playerId === player?.id) ?? null;

  const toggle = (playerId: string) => {
    setExpandedId((prev) => (prev === playerId ? null : playerId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-yellow-500" />
          Player Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No leaderboard data available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentPlayer = entry.playerId === player?.id;
              const isExpanded = expandedId === entry.playerId;

              return (
                <div
                  key={entry.playerId}
                  className={cn(
                    'rounded-lg border transition-all',
                    isCurrentPlayer
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                      : 'bg-card',
                  )}
                >
                  {/* Clickable header */}
                  <button
                    onClick={() => toggle(entry.playerId)}
                    className="flex w-full items-center gap-3 p-4 text-left cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <RankIcon rank={entry.rank} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">
                          {entry.firstName} {entry.lastName}
                        </p>
                        {isCurrentPlayer && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.centerName}</p>
                    </div>
                    <Badge variant={rankBadgeVariant(entry.rank)} className="text-sm font-bold">
                      {entry.avgScore}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Expandable details */}
                  <div
                    className={cn(
                      'grid transition-all duration-200 ease-in-out',
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t px-4 pb-4 pt-3 space-y-5">
                        {/* Full stats grid */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Career Stats
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <DetailStat
                              icon={<Trophy className="h-4 w-4 text-primary" />}
                              label="Avg Score"
                              value={entry.avgScore}
                              max={100}
                            />
                            <DetailStat
                              icon={<Target className="h-4 w-4 text-primary" />}
                              label="Total Goals"
                              value={entry.totalGoals}
                            />
                            <DetailStat
                              icon={<Flame className="h-4 w-4 text-orange-500" />}
                              label="Best Streak"
                              value={entry.bestStreak}
                            />
                            <DetailStat
                              icon={<Zap className="h-4 w-4 text-yellow-500" />}
                              label="Avg Speed"
                              value={`${entry.avgSpeedOfPlay}s`}
                            />
                            <DetailStat
                              icon={<CircleDot className="h-4 w-4 text-blue-500" />}
                              label="Total Balls"
                              value={entry.totalBalls}
                            />
                            <DetailStat
                              icon={<Dumbbell className="h-4 w-4 text-purple-500" />}
                              label="Sessions"
                              value={entry.totalSessions}
                            />
                          </div>
                        </div>

                        {/* Per-session averages */}
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Per-Session Averages
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <MiniAvg
                              label="Goals / Session"
                              value={entry.totalSessions > 0 ? (entry.totalGoals / entry.totalSessions).toFixed(1) : '0'}
                            />
                            <MiniAvg
                              label="Balls / Session"
                              value={entry.totalSessions > 0 ? Math.round(entry.totalBalls / entry.totalSessions).toString() : '0'}
                            />
                            <MiniAvg
                              label="Speed of Play"
                              value={`${entry.avgSpeedOfPlay}s`}
                            />
                          </div>
                        </div>

                        {/* Head-to-head vs current player */}
                        {!isCurrentPlayer && currentPlayerEntry && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Head to Head vs You
                            </p>
                            <HeadToHead you={currentPlayerEntry} them={entry} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ──────────────────────────────────────

function DetailStat({
  icon,
  label,
  value,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  max?: number;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
      {max !== undefined && typeof value === 'number' && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function MiniAvg({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function HeadToHead({ you, them }: { you: LeaderboardEntry; them: LeaderboardEntry }) {
  const comparisons: { label: string; youVal: number; themVal: number; higherBetter: boolean }[] = [
    { label: 'Avg Score', youVal: you.avgScore, themVal: them.avgScore, higherBetter: true },
    { label: 'Total Goals', youVal: you.totalGoals, themVal: them.totalGoals, higherBetter: true },
    { label: 'Best Streak', youVal: you.bestStreak, themVal: them.bestStreak, higherBetter: true },
    { label: 'Avg Speed', youVal: you.avgSpeedOfPlay, themVal: them.avgSpeedOfPlay, higherBetter: true },
    { label: 'Total Balls', youVal: you.totalBalls, themVal: them.totalBalls, higherBetter: true },
  ];

  return (
    <div className="space-y-2">
      {comparisons.map((c) => {
        const diff = c.youVal - c.themVal;
        const youWins = c.higherBetter ? diff > 0 : diff < 0;
        const tie = diff === 0;

        return (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 text-muted-foreground">{c.label}</span>
            {/* Your value */}
            <div className="flex flex-1 items-center justify-end gap-1">
              <span className={cn('font-semibold', youWins && !tie ? 'text-emerald-600 dark:text-emerald-400' : '')}>
                {c.youVal % 1 !== 0 ? c.youVal.toFixed(1) : c.youVal}
              </span>
            </div>
            {/* Indicator */}
            <div className="flex h-5 w-5 items-center justify-center">
              {tie ? (
                <Minus className="h-3 w-3 text-muted-foreground" />
              ) : youWins ? (
                <ArrowUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
            </div>
            {/* Their value */}
            <div className="flex flex-1 items-center gap-1">
              <span className={cn('font-semibold', !youWins && !tie ? 'text-emerald-600 dark:text-emerald-400' : '')}>
                {c.themVal % 1 !== 0 ? c.themVal.toFixed(1) : c.themVal}
              </span>
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div className="flex items-center justify-between border-t pt-2 text-[10px] text-muted-foreground">
        <span>You ({you.firstName})</span>
        <span>{them.firstName}</span>
      </div>
    </div>
  );
}
