import { useState } from 'react';
import { Target, Plus, Trash2, Trophy, TrendingUp } from 'lucide-react';
import { useGoal } from '@/context/GoalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GoalTrackerProps {
  playerId: string;
  currentAvgScore: number;
}

export function GoalTracker({ playerId, currentAvgScore }: GoalTrackerProps) {
  const { getGoal, setGoal, removeGoal } = useGoal();
  const goal = getGoal(playerId);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState('');

  const handleCreate = () => {
    const target = parseFloat(draft);
    if (isNaN(target) || target <= 0 || target > 100) return;
    setGoal(playerId, target);
    setIsCreating(false);
    setDraft('');
  };

  // Calculate progress toward goal
  if (goal) {
    const { targetScore } = goal;
    const progress = currentAvgScore > 0 ? Math.min((currentAvgScore / targetScore) * 100, 100) : 0;
    const isAchieved = currentAvgScore >= targetScore;
    const remaining = Math.max(targetScore - currentAvgScore, 0);

    return (
      <Card className={cn(
        'overflow-hidden',
        isAchieved && 'ring-2 ring-emerald-500/30',
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              {isAchieved ? (
                <Trophy className="h-4 w-4 text-emerald-500" />
              ) : (
                <Target className="h-4 w-4 text-primary" />
              )}
              Score Goal
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => removeGoal(playerId)}
              aria-label="Remove goal"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-medium">
                {currentAvgScore.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                Target: {targetScore}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isAchieved
                    ? 'bg-emerald-500'
                    : progress >= 75
                      ? 'bg-primary'
                      : progress >= 50
                        ? 'bg-amber-500'
                        : 'bg-orange-500',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status message */}
          {isAchieved ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
              <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Goal achieved! Your average score of {currentAvgScore.toFixed(1)} exceeds your target. Set a new goal to keep pushing!
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                {remaining.toFixed(1)} points to go — {progress.toFixed(0)}% of the way there
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No goal set — show create prompt
  if (isCreating) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Set a Score Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Set a target average score to work toward. Your current average is{' '}
            <strong>{currentAvgScore.toFixed(1)}</strong>.
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={100}
              step={0.1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setIsCreating(false); setDraft(''); }
              }}
              placeholder={`e.g. ${Math.min(Math.ceil(currentAvgScore + 5), 100)}`}
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={handleCreate}>
              Set Goal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsCreating(false); setDraft(''); }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Set a score goal</p>
            <p className="text-xs text-muted-foreground">
              Track your progress toward a target average
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Set Goal
        </Button>
      </CardContent>
    </Card>
  );
}
