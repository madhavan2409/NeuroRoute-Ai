import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { storage } from '../services/storage';
import { StatCard } from '../components/organizer/StatCard';
import { EventFormModal } from '../components/organizer/EventFormModal';
import { CampusEvent } from '../types/event';
import {
  Calendar,
  CalendarCheck,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    registrationsPerEvent: [],
    categoryData: [],
    trendData: [],
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recentEvents, setRecentEvents] = useState<CampusEvent[]>([]);

  const loadData = async () => {
    const s = await eventService.getOrganizerStats();
    setStats(s);
    const evts = storage.getEvents();
    setRecentEvents(evts.slice(0, 5));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Organizer Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Organizer Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time capacity fill rates, attendee registrations, and campus engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Manage Events
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle="Events published"
          icon={Calendar}
          colorScheme="indigo"
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents}
          subtitle="Registration open"
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations}
          subtitle="Active attendees"
          icon={Users}
          colorScheme="purple"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingEvents}
          subtitle="Happening soon"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Completed"
          value={stats.completedEvents}
          subtitle="Past events"
          icon={CheckCircle2}
          colorScheme="blue"
        />
      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Registrations vs Capacity per Event */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <span>Registrations vs Capacity per Event</span>
              </h3>
              <p className="text-xs text-slate-500">Comparing confirmed attendees against venue limits</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.registrationsPerEvent}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    val,
                    name === 'registered' ? 'Confirmed Registrations' : 'Max Capacity',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="registered" name="Registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>Registrations by Category</span>
              </h3>
              <p className="text-xs text-slate-500">Attendee engagement across campus domains</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {stats.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No category data yet.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Daily Registration Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Daily Registration Trajectory</span>
              </h3>
              <p className="text-xs text-slate-500">Timeline of incoming student signups across all active events</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  name="Daily Registrations"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#regGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Event Management Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Active Events</h3>
            <p className="text-xs text-slate-500">Quick access to capacity controls and participant rosters</p>
          </div>
          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All in Event Manager</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {evt.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{evt.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                <p className="text-xs text-slate-500 truncate max-w-md">{evt.venue}</p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    {evt.registeredCount} / {evt.capacity}
                  </p>
                  <p className="text-[10px] text-slate-400">seats registered</p>
                </div>

                <Link
                  to={`/organizer/events/${evt.id}/participants`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Participants</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={() => loadData()}
      />
    </div>
  );
};
