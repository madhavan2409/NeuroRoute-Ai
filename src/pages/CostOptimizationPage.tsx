import React, { useState, useEffect } from 'react';
import {
  Coins,
  Sparkles,
  Trash2,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  Zap,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { CacheEntryItem, ContextOptimizeResponse } from '../types';

export const CostOptimizationPage: React.FC = () => {
  // Context Optimizer state
  const [contextInput, setContextInput] = useState(
    "Error in cluster worker 4:\nTimeout connecting to Postgres\nTimeout connecting to Postgres\nTimeout connecting to Postgres\n\nPlease analyze why cluster worker 4 is throwing connection timeouts."
  );
  const [optimizing, setOptimizing] = useState(false);
  const [optResult, setOptResult] = useState<ContextOptimizeResponse | null>(null);

  // Cache state
  const [cacheEntries, setCacheEntries] = useState<CacheEntryItem[]>([]);
  const [loadingCache, setLoadingCache] = useState(true);
  const [cacheThreshold, setCacheThreshold] = useState(0.88);
  const [thresholdSaving, setThresholdSaving] = useState(false);

  useEffect(() => {
    fetchCache();
  }, []);

  const fetchCache = async () => {
    setLoadingCache(true);
    try {
      const res = await api.getCacheEntries();
      setCacheEntries(res);
    } catch (e) {
      console.error('Error fetching cache', e);
    } finally {
      setLoadingCache(false);
    }
  };

  const handleOptimizeContext = async () => {
    if (!contextInput.trim()) return;
    setOptimizing(true);
    try {
      const res = await api.optimizeContext(contextInput);
      setOptResult(res);
    } catch (e) {
      console.error('Optimization error', e);
    } finally {
      setOptimizing(false);
    }
  };

  const handleDeleteCacheEntry = async (id: number) => {
    try {
      await api.deleteCacheEntry(id);
      fetchCache();
    } catch (e) {
      console.error('Error deleting cache entry', e);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all semantic cache entries?')) return;
    try {
      await api.clearCache();
      fetchCache();
    } catch (e) {
      console.error('Error clearing cache', e);
    }
  };

  const handleSaveThreshold = async () => {
    setThresholdSaving(true);
    try {
      await api.setCacheThreshold(cacheThreshold);
      alert(`Semantic similarity threshold set to ${cacheThreshold}`);
    } catch (e) {
      console.error('Error setting threshold', e);
    } finally {
      setThresholdSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Coins className="w-6 h-6 text-purple-400" />
          Autonomous Cost Optimization & Semantic Caching
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Eliminate redundant API calls through cosine similarity caching and compress prompt context without losing factual information.
        </p>
      </div>

      {/* MODULE 1: CONTEXT OPTIMIZATION SANDBOX */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Context Compression & Deduplication Engine
            </h2>
            <p className="text-xs text-slate-400">
              Strips duplicate lines, normalizes whitespace, and compresses tokens before model ingestion.
            </p>
          </div>
          <button
            onClick={handleOptimizeContext}
            disabled={optimizing}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{optimizing ? 'Compressing...' : 'Optimize Context'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Original Raw Context:</label>
            <textarea
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              rows={5}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Optimized Compressed Output:</label>
            <textarea
              readOnly
              value={optResult ? optResult.optimized_text : 'Click "Optimize Context" to see compression result...'}
              rows={5}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 font-mono resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Compression Metrics */}
        {optResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 animate-in fade-in text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Original Tokens</span>
              <span className="text-sm font-bold text-slate-200 font-mono">{optResult.original_tokens}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Optimized Tokens</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">{optResult.optimized_tokens}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Tokens Saved</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {optResult.tokens_saved} ({optResult.savings_percentage}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cost Reduction</span>
              <span className="text-sm font-bold text-purple-400 font-mono">
                ${optResult.estimated_cost_reduction.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODULE 2: SEMANTIC CACHE EXPLORER */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Semantic Cache Explorer ({cacheEntries.length} Stored Responses)
            </h2>
            <p className="text-xs text-slate-400">
              Cosine vector similarity cache. Enforces strict privacy isolation for confidential records.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Threshold Slider */}
            <div className="flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Match Threshold:</span>
              <span className="font-mono text-cyan-400 font-bold">{cacheThreshold}</span>
              <input
                type="range"
                min="0.70"
                max="0.98"
                step="0.01"
                value={cacheThreshold}
                onChange={(e) => setCacheThreshold(parseFloat(e.target.value))}
                className="w-20 accent-purple-500"
              />
              <button
                onClick={handleSaveThreshold}
                className="text-[10px] bg-purple-600/40 text-purple-300 px-2 py-0.5 rounded font-bold hover:bg-purple-600"
              >
                Apply
              </button>
            </div>

            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Cache</span>
            </button>
          </div>
        </div>

        {/* Cache Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cached Prompt</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Hits</th>
                <th className="py-2.5 px-3">Tokens Saved</th>
                <th className="py-2.5 px-3">Cost Savings ($)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cacheEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No entries in semantic cache yet. Run public queries in Playground to populate.
                  </td>
                </tr>
              ) : (
                cacheEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">
                      {entry.prompt_text}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold">{entry.model_name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-300">{entry.hit_count} hits</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{entry.token_savings} tok</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">${entry.cost_savings.toFixed(6)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteCacheEntry(entry.id)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
                        title="Delete Cache Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
