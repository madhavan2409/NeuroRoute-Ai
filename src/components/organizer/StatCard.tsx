import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'indigo',
}) => {
  const schemeStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
    },
  }[colorScheme];

  return (
    <div
      className={`bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm transition-all duration-300 hover:shadow-md ${schemeStyles.border} flex items-start justify-between`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className={`p-3 rounded-xl ${schemeStyles.bg} ${schemeStyles.text} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
