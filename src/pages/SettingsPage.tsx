import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Shield,
  Layers,
  Database,
  Save,
  CheckCircle2,
  Cpu,
  Sliders,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Form states
  const [appMode, setAppMode] = useState('demo');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheThreshold, setCacheThreshold] = useState(0.88);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettingsData(res);
      setAppMode(res.app_mode);
      setCacheEnabled(res.semantic_cache_enabled);
      setCacheThreshold(res.semantic_cache_threshold);
    } catch (e) {
      console.error('Error fetching settings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        app_mode: appMode,
        semantic_cache_enabled: cacheEnabled,
        semantic_cache_threshold: cacheThreshold,
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        groq_api_key: groqKey || undefined,
        anthropic_api_key: anthropicKey || undefined
      });
      alert('Settings saved successfully!');
      setGeminiKey('');
      setOpenaiKey('');
      setGroqKey('');
      setAnthropicKey('');
      fetchSettings();
    } catch (e: any) {
      alert(e.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (slug: string) => {
    setTestingProvider(slug);
    setTestResult(null);
    try {
      const res = await api.testProvider(slug);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        provider: slug,
        status: 'error',
        message: e.message || 'Connection test failed.'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  if (loading || !settingsData) {
    return <div className="p-8 text-center text-slate-400">Loading Configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          System Settings & Provider Vault
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure application runtime mode, API keys, cache threshold parameters, and test provider connectivity.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Runtime Mode Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Globe className="w-4 h-4 text-cyan-400" />
            Application Execution Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label
              onClick={() => setAppMode('demo')}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                appMode === 'demo'
                  ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-sm">Demo Mode (Simulation)</span>
                  {appMode === 'demo' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-slate-300 leading-relaxed mt-1">
                  High-fidelity deterministic AI sandbox. Works out of the box with zero external API credentials needed.
                </p>
              </div>
              <span className="text-[10px] text-purple-300 font-semibold mt-3 block">
                • Real ML Classification &bull; Realistic Tokens &bull; Fallback Simulation
              </span>
            </label>

            <label
              onClick={() => setAppMode('live')}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                appMode === 'live'
                  ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-sm">Live Production Mode</span>
                  {appMode === 'live' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-slate-300 leading-relaxed mt-1">
                  Executes actual requests against configured Google Cloud Gemini, OpenAI, and Groq API endpoints.
                </p>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold mt-3 block">
                • Live Cloud Inference &bull; Real Token Metering &bull; Real Latency
              </span>
            </label>
          </div>
        </div>

        {/* Provider API Credentials Vault */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Provider Credentials Vault
            </h2>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              Keys encrypted at rest
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Gemini Key */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300">Google Gemini API Key:</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {settingsData.has_gemini_key ? `Masked: ${settingsData.gemini_key_masked}` : 'Not configured'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('gemini')}
                    disabled={testingProvider === 'gemini'}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-0.5 rounded font-bold"
                  >
                    {testingProvider === 'gemini' ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
              <input
                type="password"
                placeholder={settingsData.has_gemini_key ? '•••••••••••••••••••••••• (Leave blank to keep current)' : 'AIzaSy...'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
              />
            </div>

            {/* OpenAI Key */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300">OpenAI API Key:</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {settingsData.has_openai_key ? `Masked: ${settingsData.openai_key_masked}` : 'Not configured'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('openai')}
                    disabled={testingProvider === 'openai'}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-0.5 rounded font-bold"
                  >
                    {testingProvider === 'openai' ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
              <input
                type="password"
                placeholder={settingsData.has_openai_key ? '•••••••••••••••••••••••• (Leave blank to keep current)' : 'sk-proj-...'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
              />
            </div>

            {/* Groq Key */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-300">Groq API Key:</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {settingsData.has_groq_key ? `Masked: ${settingsData.groq_key_masked}` : 'Not configured'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('groq')}
                    disabled={testingProvider === 'groq'}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-0.5 rounded font-bold"
                  >
                    {testingProvider === 'groq' ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
              <input
                type="password"
                placeholder={settingsData.has_groq_key ? '•••••••••••••••••••••••• (Leave blank to keep current)' : 'gsk_...'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200"
              />
            </div>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs flex items-center justify-between">
              <span className="font-bold text-white capitalize">{testResult.provider}:</span>
              <span className="text-emerald-400">{testResult.message}</span>
              <span className="font-mono text-cyan-400">{testResult.latency_ms}ms</span>
            </div>
          )}
        </div>

        {/* Semantic Cache Settings */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-purple-400" />
            Semantic Vector Cache Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
              />
              <span className="font-semibold">Enable Semantic Caching (Saves 100% of tokens on repeated queries)</span>
            </label>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Cosine Similarity Match Threshold:</span>
                <span className="font-mono text-cyan-400 font-bold">{cacheThreshold}</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.99"
                step="0.01"
                value={cacheThreshold}
                onChange={(e) => setCacheThreshold(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
              <p className="text-[10px] text-slate-500">
                Recommended: 0.88. Queries scoring above this similarity will return cached responses immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Apply System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
