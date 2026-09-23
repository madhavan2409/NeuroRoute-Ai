import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-5 w-24 bg-slate-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="h-4 w-1/2 bg-slate-200 rounded" />
          <div className="h-2 w-full bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
      <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
      <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
      <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
      <td className="py-4 px-4"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
      <td className="py-4 px-4"><div className="h-8 w-20 bg-slate-200 rounded" /></td>
    </tr>
  );
};
