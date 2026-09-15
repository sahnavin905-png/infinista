import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5" />
      </div>
      <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
      <div className="flex justify-between pt-2">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
      </div>
    </div>
  );
};

export const UserRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
        </div>
      </div>
      <div className="w-16 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
    </div>
  );
};
