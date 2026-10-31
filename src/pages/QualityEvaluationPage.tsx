import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Award,
  Zap,
  DollarSign,
  Clock,
  Sparkles,
  Trophy,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ModelItem, CompetitionResponse } from '../types';

export const QualityEvaluationPage: React.FC = () => {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'gemini-1.5-flash',
    'gpt-4o-mini',
    'llama-3.1-8b-instant'
  ]);
  const [prompt, setPrompt] = useState('Explain the difference between TCP and UDP protocols in distributed systems.');
  const [compResult, setCompResult] = useState<CompetitionResponse | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.getModels().then((res) => {
      setModels(res);
    }).catch(console.error);
  }, []);

  const handleToggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      if (selectedModelIds.length > 2) {
        setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId));
      }
    } else {
      if (selectedModelIds.length < 4) {
        setSelectedModelIds([...selectedModelIds, modelId]);
      }
    }
  };

  const handleRunCompetition = async () => {
    if (!prompt.trim() || selectedModelIds.length < 2) return;
    setRunning(true);
    try {
      const res = await api.runCompetition(prompt, selectedModelIds);
      setCompResult(res);
    } catch (e: any) {
      alert(e.message || 'Competition execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Quality Evaluation & Multi-Model Arena
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Benchmark LLM response quality (Correctness, Relevance, Completeness, Clarity) and run side-by-side competition arenas.
        </p>
      </div>

      {/* Quality Framework Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Correctness (25%)', desc: 'Factual consistency, syntax accuracy, mathematical validity.', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
          { title: 'Relevance (30%)', desc: 'Alignment with user intent and coverage of core prompt constraints.', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
          { title: 'Completeness (30%)', desc: 'Substance, comprehensive coverage proportional to complexity.', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
          { title: 'Clarity (15%)', desc: 'Formatting structure, readability, code block modularity.', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' }
        ].map((f, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.color}`}>
                Weighted Metric
              </span>
              <h3 className="text-sm font-bold text-white mt-2">{f.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MULTI-MODEL COMPETITION ARENA */}
      <div className="glass-card rounded-2xl p-6 space-y-5 border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Multi-Model Competition Arena
            </h2>
            <p className="text-xs text-slate-400">
              Select 2 to 4 approved models to evaluate identical requests simultaneously.
            </p>
          </div>

          <button
            onClick={handleRunCompetition}
            disabled={running}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{running ? 'Benchmarking Models...' : 'Run Arena Competition'}</span>
          </button>
        </div>

        {/* Model Selection Chips */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Selected Competitor Models (Pick 2 to 4):
          </label>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => {
              const isSelected = selectedModelIds.includes(m.model_id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleToggleModel(m.model_id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-normal">Tier {m.tier}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benchmark Test Prompt Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Arena Test Query:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Competition Results Matrix */}
        {compResult && (
          <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in">
            {/* Winner Announcement Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  FinOps Winner Crowned
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  {compResult.recommended_model}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {compResult.recommendation_reason}
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compResult.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    r.winner
                      ? 'bg-purple-950/20 border-purple-500/60 shadow-xl shadow-purple-950/20'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-white text-xs">{r.model_name}</span>
                      {r.winner && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Winner
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mb-3">{r.provider}</div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div className="p-2 rounded bg-slate-800/40">
                        <span className="text-[9px] text-slate-400 block">Quality</span>
                        <span className="font-bold text-indigo-400">{r.quality_score}/100</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/40">
                        <span className="text-[9px] text-slate-400 block">Cost</span>
                        <span className="font-bold text-emerald-400 font-mono">${r.total_cost.toFixed(5)}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/40">
                        <span className="text-[9px] text-slate-400 block">Latency</span>
                        <span className="font-bold text-cyan-400 font-mono">{r.latency_ms.toFixed(0)}ms</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {r.response_text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
