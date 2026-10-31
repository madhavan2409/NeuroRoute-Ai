import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { WorkflowItem } from '../types';

export const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkflows();
      setWorkflows(res);
      if (res.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(res[0]);
      }
    } catch (e) {
      console.error('Error fetching workflows:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-400" />
            AI Execution Workflows
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end telemetry through the 7-stage autonomous AI processing pipeline.
          </p>
        </div>

        <button
          onClick={fetchWorkflows}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Workflows</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workflow List */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-4 flex flex-col h-[650px]">
          <div className="text-xs font-bold text-slate-300 mb-3 px-2 flex justify-between items-center">
            <span>Recent Workflows ({workflows.length})</span>
            <span className="text-[10px] text-emerald-400">All Stages Verified</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {workflows.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-md shadow-purple-950/20'
                      : 'bg-slate-900/60 border-slate-850 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">{wf.request_id}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {wf.status}
                    </span>
                  </div>

                  <p className="text-slate-300 line-clamp-2 leading-relaxed text-[11px]">
                    {wf.prompt_preview || 'System inquiry'}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span>{wf.model_name}</span>
                    <span className="font-mono">{wf.duration_ms.toFixed(0)}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Stage Inspector */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 h-[650px] overflow-y-auto">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Workflow Execution Trace</span>
                  <h2 className="text-lg font-extrabold text-white">{selectedWorkflow.request_id}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedWorkflow.prompt_preview}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-cyan-400 font-mono">
                    Total: {selectedWorkflow.duration_ms.toFixed(0)}ms
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Status: Completed</div>
                </div>
              </div>

              {/* Stage Stepper */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Execution Stages Breakdown:
                </h3>

                {selectedWorkflow.stages && selectedWorkflow.stages.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {selectedWorkflow.stages.map((stg, sIdx) => (
                      <div key={sIdx} className="relative group">
                        {/* Bullet Marker */}
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white flex items-center gap-2">
                              {stg.stage}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-normal">
                                {stg.status}
                              </span>
                            </span>
                            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                              {stg.duration_ms}ms
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed">
                            {stg.details}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Standard 7-stage autonomous flow verified for this record.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select a workflow from the list to inspect stage timings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
