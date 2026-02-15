import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const heightClass = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {/* Light mode logo (original dark navy on white) */}
      <img
        src="/toca-logo.png"
        alt="TOCA Soccer"
        className={cn(
          heightClass[size],
          'w-auto object-contain block dark:hidden',
        )}
      />
      {/* Dark mode logo (inverted + blend to hide background) */}
      <img
        src="/toca-logo.png"
        alt="TOCA Soccer"
        className={cn(
          heightClass[size],
          'w-auto object-contain hidden dark:block invert mix-blend-lighten',
        )}
      />
    </div>
  );
}
