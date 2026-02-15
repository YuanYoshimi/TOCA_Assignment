import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { TrainingSession } from '@/types/models';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SessionFilters {
  search: string;
  minScore: number | null;
  maxScore: number | null;
}

const EMPTY_FILTERS: SessionFilters = {
  search: '',
  minScore: null,
  maxScore: null,
};

interface SessionFiltersBarProps {
  sessions: TrainingSession[];
  onFiltered: (filtered: TrainingSession[]) => void;
}

export function SessionFiltersBar({ sessions, onFiltered }: SessionFiltersBarProps) {
  const [filters, setFilters] = useState<SessionFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState(false);

  // Get unique trainers for display
  const trainers = useMemo(
    () => [...new Set(sessions.map((s) => s.trainerName))],
    [sessions],
  );

  // Apply filters and notify parent
  const filtered = useMemo(() => {
    let result = sessions;

    // Trainer name search
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.trainerName.toLowerCase().includes(q) ||
          new Date(s.startTime).toLocaleDateString().includes(q),
      );
    }

    // Score range
    if (filters.minScore !== null) {
      result = result.filter((s) => s.score >= filters.minScore!);
    }
    if (filters.maxScore !== null) {
      result = result.filter((s) => s.score <= filters.maxScore!);
    }

    return result;
  }, [sessions, filters]);

  // Push filtered results to parent whenever they change
  useMemo(() => {
    onFiltered(filtered);
  }, [filtered, onFiltered]);

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.minScore !== null ? 1 : 0) +
    (filters.maxScore !== null ? 1 : 0);

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="space-y-2">
      {/* Search + toggle row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by trainer or date..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button
          variant={expanded ? 'secondary' : 'outline'}
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filters
          {activeCount > 0 && (
            <Badge variant="default" className="ml-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center">
              {activeCount}
            </Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={clearAll}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 p-3">
          {/* Score range */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Score:</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minScore ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minScore: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              className="h-7 w-16 text-xs"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxScore ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxScore: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              className="h-7 w-16 text-xs"
            />
          </div>

          {/* Quick trainer filter chips */}
          <div className="flex flex-wrap gap-1">
            {trainers.map((t) => {
              const isActive = filters.search.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      search: isActive ? '' : t,
                    }))
                  }
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter results count */}
      {activeCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {sessions.length} sessions
        </p>
      )}
    </div>
  );
}
