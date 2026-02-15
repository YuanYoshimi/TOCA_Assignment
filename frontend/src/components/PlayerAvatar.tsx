import { useAvatar } from '@/context/AvatarContext';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  playerId: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatar({ playerId, initials, size = 'md', className }: PlayerAvatarProps) {
  const { getAvatar } = useAvatar();
  const avatarUrl = getAvatar(playerId);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-24 w-24 text-3xl',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={initials}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
