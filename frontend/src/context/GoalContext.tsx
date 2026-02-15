import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────

export interface PlayerGoal {
  targetScore: number;
  createdAt: string; // ISO date
}

interface GoalState {
  goals: Record<string, PlayerGoal>; // playerId → goal
  setGoal: (playerId: string, targetScore: number) => void;
  removeGoal: (playerId: string) => void;
  getGoal: (playerId: string) => PlayerGoal | null;
}

// ─── Persistence ──────────────────────────────────────────

const STORAGE_KEY = 'toca_goals';

function loadGoals(): Record<string, PlayerGoal> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PlayerGoal>) : {};
  } catch {
    return {};
  }
}

function saveGoals(goals: Record<string, PlayerGoal>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

// ─── Context ──────────────────────────────────────────────

const GoalContext = createContext<GoalState | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Record<string, PlayerGoal>>(loadGoals);

  const setGoal = useCallback((playerId: string, targetScore: number) => {
    setGoals((prev) => {
      const next = {
        ...prev,
        [playerId]: { targetScore, createdAt: new Date().toISOString() },
      };
      saveGoals(next);
      return next;
    });
  }, []);

  const removeGoal = useCallback((playerId: string) => {
    setGoals((prev) => {
      const next = { ...prev };
      delete next[playerId];
      saveGoals(next);
      return next;
    });
  }, []);

  const getGoal = useCallback(
    (playerId: string): PlayerGoal | null => goals[playerId] ?? null,
    [goals],
  );

  return (
    <GoalContext.Provider value={{ goals, setGoal, removeGoal, getGoal }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal(): GoalState {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoal must be used within GoalProvider');
  return ctx;
}
