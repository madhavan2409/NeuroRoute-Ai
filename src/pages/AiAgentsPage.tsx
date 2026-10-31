import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  RefreshCw,
  Search,
  Sliders,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { AgentItem, AgentActivityLog } from '../types';

export const AiAgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<AgentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.getAgents();
      setAgents(res.agents);
      setActivityLogs(res.activity_log);
    } catch (e) {
      console.error('Error fetching agents:', e);
    } finally {
      setLoading(false);
    }
  };

  const agentIcons: Record<string, string> = {
    'Classification Agent': '🧠',
    'Routing Agent': '⚡',
    'Cost Optimization Agent': '💰',
    'Quality Evaluation Agent': '🎯',
    'Security Agent': '🛡️',
    'Monitoring Agent': '📡'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            Autonomous AI FinOps Agents
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            6 specialized background agents orchestrating classification, routing, optimization, quality, security, and provider health.
          </p>
        </div>

        <button
          onClick={fetchAgents}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Agents Telemetry</span>
        </button>
      </div>

      {/* 6 Autonomous Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-slate-800 hover:border-purple-500/40 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{agentIcons[agent.name] || '🤖'}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{agent.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {agent.description}
              </p>

              {/* Responsibilities list */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Core Responsibilities:
                </span>
                <ul className="space-y-1">
                  {agent.responsibilities.map((resp, rIdx) => (
                    <li key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Action */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latest Execution:</span>
              <p className="text-[11px] text-purple-200 mt-0.5 font-medium leading-tight">
                {agent.recent_activity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Agent Activity Stream */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          Autonomous Agent Execution Audit Trail
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Action Completed</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <span>{agentIcons[log.agent_name] || '⚡'}</span>
                    <span>{log.agent_name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.details}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
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
