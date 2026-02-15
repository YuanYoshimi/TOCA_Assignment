import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AvatarState {
  /** Map of playerId → data URL string */
  avatars: Record<string, string>;
  setAvatar: (playerId: string, dataUrl: string) => void;
  removeAvatar: (playerId: string) => void;
  getAvatar: (playerId: string) => string | null;
}

const STORAGE_KEY = 'toca_avatars';

const AvatarContext = createContext<AvatarState | undefined>(undefined);

function loadAvatars(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveAvatars(avatars: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
}

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatars, setAvatars] = useState<Record<string, string>>(loadAvatars);

  const setAvatar = useCallback((playerId: string, dataUrl: string) => {
    setAvatars((prev) => {
      const next = { ...prev, [playerId]: dataUrl };
      saveAvatars(next);
      return next;
    });
  }, []);

  const removeAvatar = useCallback((playerId: string) => {
    setAvatars((prev) => {
      const next = { ...prev };
      delete next[playerId];
      saveAvatars(next);
      return next;
    });
  }, []);

  const getAvatar = useCallback(
    (playerId: string): string | null => avatars[playerId] ?? null,
    [avatars],
  );

  return (
    <AvatarContext.Provider value={{ avatars, setAvatar, removeAvatar, getAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar(): AvatarState {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be used within AvatarProvider');
  return ctx;
}
