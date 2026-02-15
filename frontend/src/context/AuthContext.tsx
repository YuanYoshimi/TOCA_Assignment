import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Profile } from '@/types/models';

interface AuthState {
  player: Profile | null;
  signIn: (player: Profile) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'toca_player';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Profile) : null;
    } catch {
      return null;
    }
  });

  const signIn = useCallback((p: Profile) => {
    setPlayer(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, []);

  const signOut = useCallback(() => {
    setPlayer(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (player) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    }
  }, [player]);

  return (
    <AuthContext.Provider value={{ player, signIn, signOut, isAuthenticated: player !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
