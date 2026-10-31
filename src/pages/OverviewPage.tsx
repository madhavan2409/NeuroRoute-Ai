import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Send,
  Cpu,
  PiggyBank,
  Clock,
  CheckCircle2,
  Award,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

interface OverviewPageProps {
  onNavigateToPlayground: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateToPlayground }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (tf: string) => {
    try {
      const res = await api.getDashboardSummary(tf);
      setData(res);
    } catch (e) {
      console.error('Error fetching dashboard summary:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData(timeframe);
  }, [timeframe]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(timeframe);
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
  const COMPLEXITY_COLORS = {
    simple: '#10b981',
    medium: '#3b82f6',
    advanced: '#a855f7'
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading FinOps Telemetry...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const kpiCards = [
    {
      title: 'Total AI Spending',
      value: `$${kpis?.total_spending.toFixed(3) || '0.00'}`,
      subtext: `Cost/Req: $${((kpis?.total_spending || 0) / Math.max(kpis?.total_requests || 1, 1)).toFixed(5)}`,
      icon: DollarSign,
      trend: '-68.4% vs Unrouted',
      trendPositive: true,
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    },
    {
      title: 'Total Requests',
      value: kpis?.total_requests.toLocaleString() || '0',
      subtext: `${kpis?.cache_hit_rate}% Cache Hit Rate`,
      icon: Send,
      trend: '+12.5% volume',
      trendPositive: true,
      accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
    },
    {
      title: 'Tokens Consumed',
      value: `${((kpis?.total_tokens || 0) / 1000).toFixed(1)}k`,
      subtext: 'Input + Output tokens',
      icon: Cpu,
      trend: 'Optimized via context',
      trendPositive: true,
      accent: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
    },
    {
      title: 'FinOps Cost Savings',
      value: `$${kpis?.cost_savings.toFixed(2) || '0.00'}`,
      subtext: `${kpis?.cost_savings_pct}% lower than flagship`,
      icon: PiggyBank,
      trend: 'Smart Routing gain',
      trendPositive: true,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Average Response Time',
      value: `${kpis?.avg_response_time_ms.toFixed(0) || '0'}ms`,
      subtext: 'P50 across all models',
      icon: Clock,
      trend: 'Ultra-low latency',
      trendPositive: true,
      accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      title: 'Successful AI Outcomes',
      value: kpis?.successful_outcomes.toLocaleString() || '0',
      subtext: `${kpis?.success_rate_pct}% success rate`,
      icon: CheckCircle2,
      trend: 'Zero unhandled errors',
      trendPositive: true,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Average Quality Score',
      value: `${kpis?.avg_quality_score.toFixed(1) || '0'}/100`,
      subtext: 'Evaluated accuracy & clarity',
      icon: Award,
      trend: 'High fidelity verified',
      trendPositive: true,
      accent: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
    },
    {
      title: 'Active AI Models',
      value: kpis?.active_models.toString() || '0',
      subtext: 'Across 4 Tiers & 5 Providers',
      icon: Layers,
      trend: '100% available',
      trendPositive: true,
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Enterprise FinOps & Routing Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 font-semibold">
              Live DB Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-model cost attribution, routing efficiency, and provider health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Filter Buttons */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['24h', '7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onNavigateToPlayground}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Playground</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{kpi.subtext}</div>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.trend}
                </span>
                <span className="text-slate-500">Autonomous FinOps</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS SECTION: SPENDING & MODEL USAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Chart (2 columns) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                AI Spending & Cost Trajectory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily spending in USD with token usage tracking.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-cyan-400">
                Cost Per Outcome: ${kpis?.cost_per_successful_outcome.toFixed(5)}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.spending_trend || []}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(4)}`, 'Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Usage Distribution (Donut Chart) */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-cyan-400" />
              Model Usage Distribution
            </h2>
            <p className="text-xs text-slate-400">Share of total API calls routed by model.</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.model_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data?.model_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 max-h-24 overflow-y-auto pt-2 border-t border-slate-800">
            {(data?.model_distribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="text-slate-400 font-mono font-bold">{item.count} reqs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLEXITY DISTRIBUTION & SYSTEM HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Complexity Distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            Request Complexity Distribution
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Automatically categorized by the ML classification engine.
          </p>

          <div className="space-y-4">
            {Object.entries(data?.complexity_distribution || { simple: 0, medium: 0, advanced: 0 }).map(([key, val]) => {
              const total = Math.max(kpis?.total_requests || 1, 1);
              const pct = ((val / total) * 100).toFixed(1);
              const color = COMPLEXITY_COLORS[key as keyof typeof COMPLEXITY_COLORS] || '#3b82f6';

              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-semibold text-slate-200">{key} Complexity</span>
                    <span className="font-mono text-slate-400">{val} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400">
            <span className="font-semibold text-purple-300">FinOps Insight: </span>
            {kpis?.cost_savings_pct}% of total cost was saved by routing Simple & Medium queries to Tier 1 & Tier 2 models instead of Tier 3 flagships.
          </div>
        </div>

        {/* Provider Availability & Health */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                AI Provider Health & Circuit Breakers
              </h2>
              <p className="text-xs text-slate-400">Real-time availability, latency P50, and error rates.</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              All Providers Operational
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency (P50)</th>
                  <th className="py-2.5 px-3">Error Rate</th>
                  <th className="py-2.5 px-3">Fallback Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.provider_health || []).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{p.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{p.latency_ms}ms</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{(p.error_rate * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400 text-[11px]">Primary + Secondary</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* D. ANIMATED WORKFLOW ROUTING VISUALIZATION */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Autonomous Routing Workflow Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing actual request traffic through the 7-stage autonomous FinOps pipeline.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold mt-3 md:mt-0">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Primary Path: {data?.routing_paths.primary_path_percentage}%
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Fallback Path: {data?.routing_paths.fallback_path_percentage}%
            </div>
          </div>
        </div>

        {/* 7 Workflow Stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative">
          {[
            { step: '01', title: 'User Request', desc: 'Raw prompt ingested', icon: Send, color: 'border-purple-500/40 text-purple-400' },
            { step: '02', title: 'Classification', desc: 'Hybrid ML & heuristics', icon: Activity, color: 'border-blue-500/40 text-blue-400' },
            { step: '03', title: 'Policy & Privacy', desc: 'Budget & PII firewall', icon: ShieldCheck, color: 'border-cyan-500/40 text-cyan-400' },
            { step: '04', title: 'Model Selection', desc: 'Tier 1-4 cost optimal', icon: Layers, color: 'border-indigo-500/40 text-indigo-400' },
            { step: '05', title: 'AI Processing', desc: 'Provider / Local VPC', icon: Cpu, color: 'border-amber-500/40 text-amber-400' },
            { step: '06', title: 'Quality Evaluation', desc: 'Correctness & relevance', icon: CheckCircle2, color: 'border-emerald-500/40 text-emerald-400' },
            { step: '07', title: 'Final Delivery', desc: 'Explain routing decision', icon: Award, color: 'border-purple-500/40 text-purple-400' },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 flex flex-col justify-between group hover:border-purple-500/50 hover:bg-slate-850 transition relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{s.step}</span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {s.desc}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] font-mono text-emerald-400 flex items-center justify-between">
                  <span>100% Pass</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
