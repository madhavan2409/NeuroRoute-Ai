import React from 'react';
import { Users } from 'lucide-react';

interface CapacityIndicatorProps {
  registeredCount: number;
  capacity: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({
  registeredCount,
  capacity,
  showDetails = true,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const seatsRemaining = Math.max(0, capacity - registeredCount);

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50';

  if (percentage >= 100) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50';
  } else if (percentage >= 85 || seatsRemaining <= 5) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full space-y-1.5">
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="text-slate-900">{registeredCount}</strong> / {capacity} filled
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>
            {seatsRemaining === 0 ? 'Full' : `${seatsRemaining} left`}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={registeredCount}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-label={`${registeredCount} of ${capacity} seats registered`}
        />
      </div>
    </div>
  );
};
