import React from 'react';
import { EventStatus } from '../../types/event';
import { RegistrationStatus } from '../../types/registration';

interface StatusBadgeProps {
  status: EventStatus | RegistrationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  const normalized = status.toLowerCase();

  if (normalized.includes('open') || normalized === 'confirmed') {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (normalized.includes('almost') || normalized === 'pending') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (normalized.includes('closed') || normalized.includes('full') || normalized === 'cancelled') {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (normalized === 'completed') {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (normalized.includes('soon') || normalized === 'draft') {
    colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  } else if (normalized === 'registered') {
    colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    dotColor = 'bg-indigo-500';
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-colors ${colorStyles} ${sizeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
