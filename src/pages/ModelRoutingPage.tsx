import React, { useState, useEffect } from 'react';
import {
  Route,
  Sliders,
  CheckCircle2,
  Shield,
  Zap,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { RoutingPolicyItem } from '../types';

export const ModelRoutingPage: React.FC = () => {
  const [policy, setPolicy] = useState<RoutingPolicyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Route Simulator state
  const [testPrompt, setTestPrompt] = useState('Write an async web scraper in Python with rate limiting.');
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await api.getRoutingPolicies();
      setPolicy(res);
    } catch (e) {
      console.error('Error fetching policy', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      await api.updateRoutingPolicy(policy.id, policy);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving policy', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = async () => {
    if (!testPrompt.trim()) return;
    setSimulating(true);
    try {
      const res = await api.simulateRoute(testPrompt);
      setSimResult(res);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setSimulating(false);
    }
  };

  const tiers = [
    {
      tier: 'Tier 1',
      title: 'Small & Economical',
      cost: '$0.05 - $0.15 / 1M in',
      target: 'Simple Q&A, basic coding, syntax, classification, summarization',
      models: ['Gemini 1.5 Flash', 'GPT-4o Mini', 'Llama 3.1 8B Instant'],
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    },
    {
      tier: 'Tier 2',
      title: 'Balanced General Purpose',
      cost: '$0.60 - $1.25 / 1M in',
      target: 'Medium complexity, custom hooks, multi-file code, data analysis',
      models: ['Gemini 1.5 Pro', 'Llama 3.3 70B', 'Claude 3.5 Haiku'],
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10'
    },
    {
      tier: 'Tier 3',
      title: 'Advanced Flagship Reasoning',
      cost: '$2.50 - $15.00 / 1M in',
      target: 'Complex distributed architectures, formal proofs, mathematical modeling',
      models: ['GPT-4o', 'Claude 3.5 Sonnet', 'OpenAI o1'],
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    },
    {
      tier: 'Tier 4',
      title: 'Enterprise Private / Local VPC',
      cost: '$0.15 - $0.20 / 1M in',
      target: 'Confidential corporate IP, HIPAA patient data, GDPR compliance',
      models: ['Llama 3 70B Private', 'DeepSeek R1 Local'],
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    }
  ];

  if (loading || !policy) {
    return <div className="p-8 text-center text-slate-400">Loading Routing Policy Engine...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-purple-400" />
            Intelligent Model Routing Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic routing policies, quality thresholds, and inspect pre-flight model selection simulation.
          </p>
        </div>

        <button
          onClick={handleSavePolicy}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : saveSuccess ? 'Policy Saved!' : 'Save Routing Policy'}</span>
        </button>
      </div>

      {/* Model Tiers Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((t, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${t.color}`}>
                  {t.tier}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{t.cost}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{t.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t.target}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Models:</span>
              <div className="flex flex-wrap gap-1">
                {t.models.map((m, mIdx) => (
                  <span key={mIdx} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Controls & Live Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Configuration Controls */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Active FinOps Policy Controls
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Policy Enforced
            </span>
          </div>

          {/* Min Quality Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Minimum Acceptable Quality Score:</span>
              <span className="font-mono text-cyan-400 font-bold">{policy.min_quality}/100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={policy.min_quality}
              onChange={(e) => setPolicy({ ...policy, min_quality: parseFloat(e.target.value) })}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-slate-500">Models scoring below this threshold are disqualified.</p>
          </div>

          {/* Max Cost Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Max Request Cost Cap:</span>
              <span className="font-mono text-purple-400 font-bold">${policy.max_cost.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.50"
              step="0.01"
              value={policy.max_cost}
              onChange={(e) => setPolicy({ ...policy, max_cost: parseFloat(e.target.value) })}
              className="w-full accent-purple-500"
            />
            <p className="text-[10px] text-slate-500">Demotes queries to cheaper tiers if estimated cost exceeds limit.</p>
          </div>

          {/* Max Latency Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Max Acceptable P50 Latency:</span>
              <span className="font-mono text-amber-400 font-bold">{policy.max_latency_ms}ms</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={policy.max_latency_ms}
              onChange={(e) => setPolicy({ ...policy, max_latency_ms: parseFloat(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Preferred Provider */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Preferred Provider:</label>
            <select
              value={policy.preferred_provider}
              onChange={(e) => setPolicy({ ...policy, preferred_provider: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Any">Any (Pure Cost & Latency Optimization)</option>
              <option value="Google Cloud AI">Google Cloud AI (Gemini)</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Groq Ultra-Low Latency">Groq</option>
              <option value="Anthropic">Anthropic</option>
            </select>
          </div>

          {/* Allowed Providers */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Allowed Providers (Comma Separated):</label>
            <input
              type="text"
              value={policy.allowed_providers}
              onChange={(e) => setPolicy({ ...policy, allowed_providers: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Live Route Simulator */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Pre-Flight Route Simulator
            </h2>
            <span className="text-xs text-slate-400">Zero-cost route preview</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Test Prompt:</label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-xl text-xs font-bold border border-purple-500/40 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{simulating ? 'Analyzing...' : 'Simulate Model Selection'}</span>
            </button>
          </div>

          {simResult && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Selected Candidate:</span>
                <span className="text-xs font-extrabold text-cyan-400">
                  {simResult.selected_model} ({simResult.tier_label})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 text-[11px] text-slate-300">
                <span className="font-bold text-purple-300">Selection Justification: </span>
                {simResult.reason}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                  <span className="font-mono font-bold text-white">${simResult.estimated_cost.toFixed(6)}</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">Est. Latency</span>
                  <span className="font-mono font-bold text-cyan-400">{simResult.estimated_latency_ms}ms</span>
                </div>
                <div className="p-2 rounded bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">FinOps Savings</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.cost_savings_pct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
