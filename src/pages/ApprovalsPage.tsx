import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Check,
  X,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Layers,
  DollarSign,
  Route,
  Shield
} from 'lucide-react';
import { api } from '../services/api';
import { ApprovalItem } from '../types';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.getApprovals();
      setApprovals(res);
    } catch (e) {
      console.error('Error fetching approvals', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.approveAction(id, 'Alex Vance (Lead Architect)');
      fetchApprovals();
    } catch (e) {
      console.error('Approve error', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await api.rejectAction(id, 'Alex Vance (Lead Architect)');
      fetchApprovals();
    } catch (e) {
      console.error('Reject error', e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'model': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'budget': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'provider': return <Route className="w-4 h-4 text-cyan-400" />;
      default: return <Shield className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            FinOps Governance & Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise change approval workflows for model activations, budget adjustments, provider integrations, and policy changes.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Approvals</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
              filter === tab
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab} ({approvals.filter((a) => tab === 'all' || a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Approvals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApprovals.map((appr) => (
          <div
            key={appr.id}
            className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {getCategoryIcon(appr.category)}
                  <span>{appr.category} Change</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    appr.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : appr.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {appr.status}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-white mt-1">{appr.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{appr.details}</p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Requested by: <strong className="text-slate-200">{appr.requested_by}</strong></span>
                <span className="font-mono">{new Date(appr.created_at).toLocaleDateString()}</span>
              </div>

              {appr.reviewer && (
                <div className="mt-2 text-[10px] text-purple-300">
                  Reviewed by {appr.reviewer} on {appr.reviewed_at ? new Date(appr.reviewed_at).toLocaleDateString() : ''}
                </div>
              )}
            </div>

            {/* Action Buttons for Pending */}
            {appr.status === 'pending' && (
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleApprove(appr.id)}
                  disabled={actionLoading === appr.id}
                  className="flex-1 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Change</span>
                </button>
                <button
                  onClick={() => handleReject(appr.id)}
                  disabled={actionLoading === appr.id}
                  className="flex-1 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
