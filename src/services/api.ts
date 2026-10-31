/**
 * SmartRoute AI - Frontend API Client
 */

import {
  DashboardSummary,
  ChatResponse,
  ModelItem,
  ProviderItem,
  RoutingPolicyItem,
  BudgetItem,
  CacheEntryItem,
  SecurityEventItem,
  ApprovalItem,
  WorkflowItem,
  AgentItem,
  AgentActivityLog,
  CompetitionResponse,
  ContextOptimizeResponse
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // Use fallback errorMsg
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Health
  getHealth: () => fetchJSON<{ status: string; app_mode: string; version: string }>('/health'),

  // Dashboard & Analytics
  getDashboardSummary: (timeframe: string = '7d') =>
    fetchJSON<DashboardSummary>(`/dashboard/summary?timeframe=${timeframe}`),
  getAnalytics: (timeframe: string = '7d') =>
    fetchJSON<DashboardSummary>(`/analytics?timeframe=${timeframe}`),
  exportCSVUrl: `${API_BASE}/analytics/export`,

  // Core Chat & Routing
  sendChat: (prompt: string, options?: { force_model_id?: string; allow_cache?: boolean }) =>
    fetchJSON<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    }),

  classify: (prompt: string) =>
    fetchJSON<any>('/classify', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  getMlMetrics: () => fetchJSON<any>('/classify/metrics'),

  simulateRoute: (prompt: string, force_model_id?: string) =>
    fetchJSON<any>('/routing/simulate', {
      method: 'POST',
      body: JSON.stringify({ prompt, force_model_id }),
    }),

  getRoutingPolicies: () => fetchJSON<RoutingPolicyItem>('/routing/policies'),
  updateRoutingPolicy: (id: number, data: Partial<RoutingPolicyItem>) =>
    fetchJSON<RoutingPolicyItem>(`/routing/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Model Registry
  getModels: () => fetchJSON<ModelItem[]>('/models'),
  createModel: (model: Partial<ModelItem>) =>
    fetchJSON<ModelItem>('/models', {
      method: 'POST',
      body: JSON.stringify(model),
    }),
  updateModel: (id: number, model: Partial<ModelItem>) =>
    fetchJSON<any>(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(model),
    }),
  deleteModel: (id: number) =>
    fetchJSON<any>(`/models/${id}`, {
      method: 'DELETE',
    }),

  // Providers
  getProviders: () => fetchJSON<ProviderItem[]>('/providers'),
  testProvider: (slug: string) =>
    fetchJSON<any>('/providers/test', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    }),

  // Semantic Cache
  getCacheEntries: () => fetchJSON<CacheEntryItem[]>('/cache'),
  deleteCacheEntry: (id: number) =>
    fetchJSON<any>(`/cache/${id}`, {
      method: 'DELETE',
    }),
  clearCache: () =>
    fetchJSON<any>('/cache/clear', {
      method: 'POST',
    }),
  setCacheThreshold: (threshold: number) =>
    fetchJSON<any>('/cache/threshold', {
      method: 'POST',
      body: JSON.stringify({ threshold }),
    }),

  // Context Optimization
  optimizeContext: (context: string) =>
    fetchJSON<ContextOptimizeResponse>('/context/optimize', {
      method: 'POST',
      body: JSON.stringify({ context }),
    }),

  // Multi-Model Competition
  runCompetition: (prompt: string, model_ids: string[]) =>
    fetchJSON<CompetitionResponse>('/competition', {
      method: 'POST',
      body: JSON.stringify({ prompt, model_ids }),
    }),

  // Security
  getSecurityEvents: () => fetchJSON<SecurityEventItem[]>('/security/events'),
  scanPrompt: (prompt: string) =>
    fetchJSON<any>('/security/scan', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // Budgets
  getBudgets: () => fetchJSON<BudgetItem[]>('/budgets'),
  createBudget: (data: Partial<BudgetItem>) =>
    fetchJSON<BudgetItem>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBudget: (id: number, data: Partial<BudgetItem>) =>
    fetchJSON<any>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Approvals
  getApprovals: () => fetchJSON<ApprovalItem[]>('/approvals'),
  approveAction: (id: number, reviewer: string = 'Admin') =>
    fetchJSON<any>(`/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', reviewer }),
    }),
  rejectAction: (id: number, reviewer: string = 'Admin') =>
    fetchJSON<any>(`/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reviewer }),
    }),

  // Workflows
  getWorkflows: () => fetchJSON<WorkflowItem[]>('/workflows'),

  // AI Agents
  getAgents: () =>
    fetchJSON<{ agents: AgentItem[]; activity_log: AgentActivityLog[] }>('/agents'),

  // Settings
  getSettings: () => fetchJSON<any>('/settings'),
  updateSettings: (data: any) =>
    fetchJSON<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
