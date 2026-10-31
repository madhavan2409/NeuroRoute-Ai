import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  RefreshCw,
  Coins
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics(timeframe);
      setData(res);
    } catch (e) {
      console.error('Error fetching analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open(api.exportCSVUrl, '_blank');
  };

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            FinOps Analytics & Cost Attribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep financial metrics, cost-per-outcome telemetry, and full audit export.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe filter */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['24h', '7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Working CSV Export Button */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FinOps Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-purple-500/20">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cost Per Successful Outcome
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            ${kpis?.cost_per_successful_outcome.toFixed(5) || '0.00000'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Formula: Total AI Cost / Successful Outcomes
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total FinOps Savings
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${kpis?.cost_savings.toFixed(2) || '0.00'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {kpis?.cost_savings_pct}% lower than unrouted flagship
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-blue-500/20">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Tokens Processed
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {kpis?.total_tokens.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {kpis?.total_requests || 0} routed queries
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cache Hit Rate & Savings
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {kpis?.cache_hit_rate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {kpis?.total_cache_entries || 0} semantic entries stored
          </div>
        </div>
      </div>

      {/* Daily Cost & Token Breakdown Chart */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Daily AI Cost & Request Volume Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative analysis of daily spend ($) and total requests.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.spending_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="spend" name="Actual Spend ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="requests" name="Request Volume" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model-Wise FinOps Attribution Table */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-cyan-400" />
          Model-Wise Spending Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Requests Routed</th>
                <th className="py-2.5 px-3">Total Spend ($)</th>
                <th className="py-2.5 px-3">Share of Total Spend</th>
                <th className="py-2.5 px-3">Avg Cost / Req</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.model_distribution || []).map((m, idx) => {
                const totalSpend = Math.max(kpis?.total_spending || 1, 0.0001);
                const sharePct = ((m.spend / totalSpend) * 100).toFixed(1);
                const costPerReq = m.count > 0 ? (m.spend / m.count).toFixed(5) : '0.00000';

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{m.count}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">${m.spend.toFixed(4)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${sharePct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{sharePct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">${costPerReq}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
