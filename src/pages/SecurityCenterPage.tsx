import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Key,
  Eye,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityEventItem } from '../types';

export const SecurityCenterPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Live scanner state
  const [scanPrompt, setScanPrompt] = useState('User John Doe SSN 000-12-3456 requested account reset.');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getSecurityEvents();
      setEvents(res);
    } catch (e) {
      console.error('Error fetching security events', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanPrompt.trim()) return;
    setScanning(true);
    try {
      const res = await api.scanPrompt(scanPrompt);
      setScanResult(res);
    } catch (e) {
      console.error('Error scanning prompt', e);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Security Center & Privacy Guard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prompt injection defenses, PII detection, automated sanitization, and compliance audit trail.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-rose-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Blocked Injections
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {events.filter((e) => e.event_type.includes('injection')).length} Attacks
          </div>
          <div className="text-[10px] text-slate-400 mt-1">100% intercepted at ingress</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sensitive / PII Detections
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {events.filter((e) => e.event_type.includes('pii')).length} Routed Private
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Confined to Tier 4 Private VPC</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            API Key Vault Protection
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">Masked & Isolated</div>
          <div className="text-[10px] text-slate-400 mt-1">Zero frontend key exposure</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-blue-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Rate Limiting Status
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">60 req/min</div>
          <div className="text-[10px] text-slate-400 mt-1">Token bucket active per tenant</div>
        </div>
      </div>

      {/* INTERACTIVE PROMPT SCANNER SANDBOX */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Interactive Injection & PII Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Test prompts against heuristic regex, DAN patterns, SSN/CC detectors, and sanitization filters.
            </p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition"
          >
            {scanning ? 'Scanning...' : 'Test Security Scan'}
          </button>
        </div>

        <div>
          <textarea
            value={scanPrompt}
            onChange={(e) => setScanPrompt(e.target.value)}
            rows={2}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-purple-500"
          />
        </div>

        {scanResult && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-3 animate-in fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Safety Verification:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                scanResult.is_safe ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {scanResult.is_safe ? 'Passed Guard' : 'Blocked (Critical Attack)'}
              </span>
            </div>

            {scanResult.flagged_reasons.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold">Flagged Anomalies:</span>
                <div className="flex flex-wrap gap-2">
                  {scanResult.flagged_reasons.map((f: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800 rounded font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Sanitized Output (Safe for Model):</span>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300">
                {scanResult.sanitized_prompt}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Audit Events Stream */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Security Audit Trail & Threat Stream
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Prompt Excerpt</th>
                <th className="py-2.5 px-3">Action Taken</th>
                <th className="py-2.5 px-3">Audit Details</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-white capitalize">{e.event_type.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityBadge(e.severity)}`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate font-mono text-[11px]">
                    {e.prompt_preview}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-cyan-400 capitalize">{e.action_taken.replace('_', ' ')}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{e.details}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
