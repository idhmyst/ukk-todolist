import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="p-4.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-xs animate-pulse flex items-start gap-3.5"
        >
          {/* Checkbox Skeleton */}
          <div className="w-5 h-5 rounded-lg bg-slate-200 mt-0.5 flex-shrink-0" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-2.5">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="flex items-center gap-2">
              <div className="h-3.5 bg-slate-200 rounded-md w-16" />
              <div className="h-3 bg-slate-100 rounded-md w-24" />
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

