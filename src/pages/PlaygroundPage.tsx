import React, { useState } from 'react';
import {
  Send,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  HelpCircle,
  AlertTriangle,
  Lock,
  Coins,
  Copy,
  Check,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ChatResponse, NvidiaClassification } from '../types';

export const PlaygroundPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [forcedModel, setForcedModel] = useState<string>('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-configured diverse sample questions covering various domains & tiers
  const samplePrompts = [
    { label: 'Coding (Simple)', text: 'How do I reverse a string in Python?' },
    { label: 'General / Concept', text: 'what is programming language' },
    { label: 'Arithmetic (Simple)', text: 'what is 2+2' },
    { label: 'Math (Medium)', text: 'Find the definite integral of e^(-2x) from 0 to infinity.' },
    { label: 'System Design (Advanced)', text: 'Architect a globally distributed active-active database with Paxos consensus and sub-10ms latency.' },
    { label: 'Reasoning (Advanced)', text: 'Prove that P != NP or outline a candidate reduction.' },
    { label: 'Sensitive / PII (Tier 4)', text: 'Patient John Doe (DOB: 1985-04-12, SSN: 000-12-3456) diagnosed with hypertension. Review treatment.' },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    const finalQuery = simulateFailure ? `${query} [SIMULATE_FAIL]` : query;

    try {
      const res = await api.sendChat(finalQuery, {
        force_model_id: forcedModel || undefined,
        allow_cache: true
      });
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'An error occurred during routing and execution.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response?.answer) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 2:
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 3:
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 4:
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  const getComplexityBadge = (comp: string) => {
    switch (comp.toLowerCase()) {
      case 'simple':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50';
      case 'medium':
        return 'bg-blue-950/60 text-blue-400 border-blue-700/50';
      case 'advanced':
        return 'bg-purple-950/60 text-purple-400 border-purple-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPrivacyBadge = (priv: string) => {
    switch (priv.toLowerCase()) {
      case 'sensitive':
        return 'bg-rose-950/60 text-rose-400 border-rose-700/50';
      case 'confidential':
        return 'bg-amber-950/60 text-amber-400 border-amber-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const nvidia: NvidiaClassification | undefined = response?.nvidia_classification;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Playground & Model Router</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Autonomous FinOps
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze prompts with NVIDIA task & complexity classification, route dynamically to optimal model tiers, and track token spend in real time.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 text-xs">
          <label className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Simulate Provider 503
            </span>
          </label>

          <select
            value={forcedModel}
            onChange={(e) => setForcedModel(e.target.value)}
            className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 focus:outline-none focus:border-slate-600 transition"
          >
            <option value="">Auto-Route (Autonomous)</option>
            <option value="gpt-4o-mini">Force Tier 1: GPT-4o Mini</option>
            <option value="llama-3.1-8b-instant">Force Tier 1: Llama 3.1 8B</option>
            <option value="gemini-1.5-pro">Force Tier 2: Gemini 1.5 Pro</option>
            <option value="llama-3.3-70b-versatile">Force Tier 2: Llama 3.3 70B</option>
            <option value="claude-3-5-sonnet">Force Tier 3: Claude 3.5 Sonnet</option>
            <option value="o1-preview">Force Tier 3: OpenAI o1</option>
            <option value="llama-3-70b-private">Force Tier 4: Private VPC</option>
          </select>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Suggested Test Queries
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(s.text)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span className="font-semibold text-slate-400">{s.label}:</span>
              <span className="truncate max-w-[220px]">{s.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Input Area */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter any programming prompt, system architecture challenge, mathematical equation, or business inquiry..."
          rows={3}
          className="w-full bg-slate-950/60 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 border border-slate-800/80 focus:border-indigo-500/80 focus:outline-none resize-none transition"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>Estimated ~{Math.ceil(prompt.length / 3.8)} input tokens</span>
            <span>•</span>
            <span className="text-slate-400">NVIDIA Multi-Dimensional Classification</span>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Classifying & Routing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute SmartRoute</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-rose-300">Routing Policy Block</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* RESPONSE & CLASSIFICATION CARDS */}
      {response && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* SECTION 1: NVIDIA PROMPT TASK & COMPLEXITY CLASSIFIER */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>NVIDIA Prompt Task & Complexity Classifier</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      nvidia/prompt-task-and-complexity-classifier
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    6 continuous complexity dimensions & 11-category task taxonomy
                  </div>
                </div>
              </div>

              {/* Status summary */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border uppercase tracking-wider ${getComplexityBadge(response.complexity)}`}>
                  {response.complexity} Complexity
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  {nvidia?.task_type || response.task_type.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1 ${getPrivacyBadge(response.privacy)}`}>
                  <Lock className="w-3 h-3" />
                  {response.privacy}
                </span>
              </div>
            </div>

            {/* Score & Dimensions Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              {/* Left Column: Overall Complexity Score */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Overall Complexity Score
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {(nvidia?.complexity_score ?? 0.15).toFixed(3)}
                    </span>
                    <span className="text-xs text-slate-400">/ 1.000</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (nvidia?.complexity_score ?? 0) > 0.65
                          ? 'bg-purple-500'
                          : (nvidia?.complexity_score ?? 0) >= 0.35
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, (nvidia?.complexity_score ?? 0.15) * 100))}%` }}
                    />
                  </div>
                  {/* Threshold Indicators */}
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0.00 (Simple)</span>
                    <span>0.35 (Medium)</span>
                    <span>0.65 (Advanced)</span>
                    <span>1.00</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/60 leading-relaxed font-mono">
                  Score = 0.35*Creativity + 0.25*Reasoning + 0.15*Constraints + 0.15*Domain + 0.05*Context + 0.05*FewShots
                </div>
              </div>

              {/* Right Column: 6 Complexity Dimensions */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Reasoning', val: nvidia?.dimensions.reasoning ?? 0.10, weight: '25%' },
                  { label: 'Domain Knowledge', val: nvidia?.dimensions.domain_knowledge ?? 0.10, weight: '15%' },
                  { label: 'Constraints', val: nvidia?.dimensions.constraints ?? 0.05, weight: '15%' },
                  { label: 'Creativity', val: nvidia?.dimensions.creativity ?? 0.05, weight: '35%' },
                  { label: 'Contextual Knowledge', val: nvidia?.dimensions.contextual_knowledge ?? 0.05, weight: '5%' },
                  { label: 'Few Shots', val: nvidia?.dimensions.few_shots ?? 0.0, weight: '5%' },
                ].map((dim, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-300">{dim.label}</span>
                      <span className="text-[10px] text-slate-500">{dim.weight}</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">
                      {dim.val.toFixed(2)}
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-slate-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(3, dim.val * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: FINOPS MODEL ROUTING & METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Model Card */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Active Model Used
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTierColor(response.model_tier)}`}>
                    Tier {response.model_tier}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-1.5 tracking-tight">
                  {response.selected_model}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Provider: <span className="text-slate-200 font-semibold">{response.selected_provider}</span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-semibold">Routing Justification: </span>
                {response.routing_explanation.reason}
              </div>
            </div>

            {/* FinOps Model Efficiency */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Model Efficiency
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {response.efficiency_rating || 'Optimal (A+)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {(response.efficiency_score ?? 96.4).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400">FinOps Efficiency</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, response.efficiency_score ?? 96.4))}%` }}
                  />
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                <span>Cost Multiplier: <strong className="text-slate-200 font-mono">{response.cost_multiplier ? `${response.cost_multiplier}x` : '24x'}</strong></span>
                <span>Speedup: <strong className="text-slate-200 font-mono">{(850 / Math.max(10, response.latency_ms)).toFixed(0)}x</strong></span>
              </div>
            </div>

            {/* Tokens Saved Card */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    Tokens Saved
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {response.tokens_saved_pct ? `${response.tokens_saved_pct.toFixed(1)}% Saved` : '80% Saved'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    +{response.tokens_saved ?? Math.max(0, response.total_tokens * 3)}
                  </span>
                  <span className="text-xs text-slate-400">tokens vs baseline</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Baseline: <span className="text-slate-200 font-mono">{response.baseline_tokens ?? response.total_tokens * 4}</span> vs Used: <span className="text-emerald-400 font-mono font-bold">{response.total_tokens}</span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Cost Avoided: <strong className="text-emerald-400 font-mono">${response.cost_savings.toFixed(6)}</strong></span>
                <span className="text-emerald-400 font-bold font-mono">({response.routing_explanation.cost_savings_pct.toFixed(1)}% off)</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: METRICS STRIP */}
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Actual Cost</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                ${response.actual_cost.toFixed(6)}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Cost Savings</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                ${response.cost_savings.toFixed(6)}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Total Tokens</div>
              <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                {response.total_tokens} <span className="text-[10px] text-slate-500 font-normal">({response.input_tokens}in/{response.output_tokens}out)</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Response Latency</div>
              <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                {response.latency_ms.toFixed(0)}ms
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Quality Score</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {response.quality_score.toFixed(1)}/100
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium">Semantic Cache</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${response.cache_status === 'HIT' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {response.cache_status}
                {response.cache_similarity ? ` (${(response.cache_similarity * 100).toFixed(0)}%)` : ''}
              </div>
            </div>
          </div>

          {/* SECTION 4: AI RESPONSE OUTPUT CARD */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Response generated by <strong className="text-white">{response.selected_model}</strong> ({response.selected_provider})
                </span>
                <span className="text-[11px] text-slate-500 font-mono ml-2">
                  ID: {response.request_id}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowExplanationModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition border border-indigo-500/30"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explain Decision</span>
                </button>
              </div>
            </div>

            {/* Answer Content */}
            <div className="text-sm text-slate-200 leading-relaxed space-y-3 font-sans whitespace-pre-wrap bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
              {response.answer}
            </div>

            {/* Quality Scorecard */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Autonomous Quality Scorecard:</span>
                <span className="text-xs font-bold text-white font-mono">Overall: {response.quality_scorecard.overall}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Correctness:</span>
                  <span className="font-bold text-slate-200 font-mono">{response.quality_scorecard.correctness}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Relevance:</span>
                  <span className="font-bold text-slate-200 font-mono">{response.quality_scorecard.relevance}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Completeness:</span>
                  <span className="font-bold text-slate-200 font-mono">{response.quality_scorecard.completeness}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400">Clarity:</span>
                  <span className="font-bold text-slate-200 font-mono">{response.quality_scorecard.clarity}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAIN ROUTING DECISION MODAL */}
      {showExplanationModal && response && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full p-6 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">SmartRoute AI Routing Explanation</h3>
                  <p className="text-[11px] text-slate-400">Audit trail for Request {response.request_id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Routing Justification */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Routing Policy Decision: </span>
              {response.routing_explanation.reason}
            </div>

            {/* Model Comparison Pathway */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Selected Model</span>
                <div className="text-sm font-bold text-indigo-400 mt-1">{response.routing_explanation.selected_model}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{response.routing_explanation.tier_label}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pre-Configured Fallback</span>
                <div className="text-sm font-bold text-slate-300 mt-1">{response.routing_explanation.fallback_candidate}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {response.routing_explanation.fallback_triggered ? 'Fallback Active' : 'Standby Ready'}
                </div>
              </div>
            </div>

            {/* Policy Checks Passed */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Verified FinOps & Safety Policies:</div>
              <div className="space-y-1.5">
                {response.routing_explanation.policy_checks_passed.map((chk, i) => (
                  <div key={i} className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Unrouted Flagship Cost: </span>
                <span className="font-bold text-slate-300 font-mono">${response.routing_explanation.unrouted_baseline_cost.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-slate-400">SmartRoute FinOps Savings: </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {response.routing_explanation.cost_savings_pct.toFixed(1)}% Saved
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplanationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
