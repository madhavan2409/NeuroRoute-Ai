import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Route,
  GitBranch,
  Bot,
  Layers,
  BarChart3,
  Coins,
  CheckCircle2,
  ShieldCheck,
  CheckSquare,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Activity,
  Check,
  X,
  ExternalLink,
  Zap,
  Lock,
  Menu
} from 'lucide-react';
import { api } from '../services/api';

interface DashboardLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workspace, setWorkspace] = useState('Production Enterprise');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [systemMode, setSystemMode] = useState<'demo' | 'live'>('demo');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Tier 1 routing saved $14.28 on batch coding queries', time: '5m ago', type: 'saving' },
    { id: 2, text: 'Security Agent redirected 1 PII query to Private VPC', time: '18m ago', type: 'security' },
    { id: 3, text: 'Provider Groq reported 95ms average latency', time: '1h ago', type: 'health' },
  ]);

  useEffect(() => {
    // Fetch initial settings to get active app mode
    api.getSettings().then((res) => {
      if (res && res.app_mode) {
        setSystemMode(res.app_mode as 'demo' | 'live');
      }
    }).catch(() => {});
  }, []);

  const handleToggleMode = async () => {
    const newMode = systemMode === 'demo' ? 'live' : 'demo';
    setSystemMode(newMode);
    try {
      await api.updateSettings({ app_mode: newMode });
    } catch (e) {
      console.error('Failed to update mode', e);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'playground', label: 'AI Playground', icon: Sparkles, badge: 'Core' },
    { id: 'routing', label: 'Model Routing', icon: Route },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'agents', label: 'AI Agents', icon: Bot, badge: '6 Active' },
    { id: 'registry', label: 'Model Registry', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'cost-optimization', label: 'Cost Optimization', icon: Coins },
    { id: 'quality', label: 'Quality Evaluation', icon: CheckCircle2 },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: '1' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0a0e17] text-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex-shrink-0 transition-all duration-300 flex flex-col bg-[#0c1220]/90 backdrop-blur-xl border-r border-slate-800/80 z-30`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-600/25 flex-shrink-0">
              <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
                <Route className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              </div>
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  SmartRoute <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block -mt-0.5">
                  Autonomous FinOps
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items (12 Items) */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/10 text-white border border-purple-500/30 shadow-md shadow-purple-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-purple-400'
                  } ${!sidebarOpen ? 'mx-auto' : 'mr-3'}`}
                />
                {sidebarOpen && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer / System Mode Switch */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          {sidebarOpen ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${systemMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <div>
                  <div className="text-xs font-semibold text-slate-200 capitalize">
                    {systemMode === 'live' ? 'Live Provider APIs' : 'High-Fidelity Demo'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {systemMode === 'live' ? 'Real API Keys active' : 'Deterministic Sandbox'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleMode}
                className="text-[10px] font-bold px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded border border-purple-500/40 transition"
              >
                {systemMode === 'live' ? 'Switch Demo' : 'Switch Live'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleMode}
              className="w-full flex justify-center py-2"
              title={`Mode: ${systemMode.toUpperCase()}`}
            >
              <div className={`w-3 h-3 rounded-full ${systemMode === 'live' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 flex-shrink-0 bg-[#0c1220]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-20">
          {/* Global Search */}
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search models, policies, request IDs, or routes... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/70 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>
          </div>

          {/* Right Top Nav Items */}
          <div className="flex items-center space-x-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">99.98% Health</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-mono">P50 185ms</span>
            </div>

            {/* Workspace Selector */}
            <div className="relative">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold">{workspace}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Workspace
                  </div>
                  {['Production Enterprise', 'Research & Dev', 'FinOps Staging'].map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between text-slate-200 hover:bg-purple-600/20 hover:text-white transition"
                    >
                      <span>{ws}</span>
                      {workspace === ws && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">System Notifications</span>
                    <span className="text-[10px] text-purple-400 cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear</span>
                  </div>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                          <p className="text-slate-300 font-medium">{n.text}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  SR
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200">Alex Vance</div>
                <div className="text-[10px] text-purple-400">FinOps Lead Architect</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0e17] via-[#090d16] to-[#060911] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
