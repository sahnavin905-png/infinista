import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

const indicatorClasses = {
  xs: 'w-2 h-2 right-0 bottom-0',
  sm: 'w-2.5 h-2.5 right-0 bottom-0',
  md: 'w-3 h-3 right-0.5 bottom-0.5',
  lg: 'w-4 h-4 right-1 bottom-1',
  xl: 'w-5 h-5 right-1.5 bottom-1.5',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isOnline,
  className = '',
  onClick,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const initials = alt
    ? alt
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'V';

  return (
    <div
      className={`relative inline-block flex-shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-transparent transition-all duration-200 flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-neutral-200 dark:border-neutral-800`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={`absolute rounded-full ring-2 ring-white dark:ring-neutral-900 ${indicatorClasses[size]} ${
            isOnline ? 'bg-emerald-500' : 'bg-neutral-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
