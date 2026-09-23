import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventRegistration } from '../types/registration';
import { registrationService } from '../services/registrationService';
import { storage } from '../services/storage';
import { StatusBadge } from '../components/common/StatusBadge';
import { TicketModal } from '../components/event/TicketModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { formatDate, formatTime } from '../lib/utils';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  XCircle,
  ExternalLink,
  Inbox,
  AlertTriangle,
  Compass,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<EventRegistration | null>(null);
  const [cancelTargetReg, setCancelTargetReg] = useState<EventRegistration | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRegistrations = async () => {
    if (!user) return;
    const data = await registrationService.getStudentRegistrations(user.id);
    setRegistrations(data);
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      fetchRegistrations();
    });
    return unsub;
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancelTargetReg) return;
    try {
      setIsCancelling(true);
      await registrationService.cancelRegistration(cancelTargetReg.id);
      showToast('Registration cancelled. Your reserved seat has been released.', 'info');
      setCancelTargetReg(null);
      fetchRegistrations();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Metrics computation
  const totalRegistered = registrations.length;
  const now = new Date();

  const upcomingCount = registrations.filter((r) => {
    if (r.status === 'Cancelled') return false;
    if (!r.eventDate) return true;
    return new Date(`${r.eventDate}T23:59:59`) >= now;
  }).length;

  const completedCount = registrations.filter((r) => {
    if (r.status === 'Cancelled') return false;
    if (!r.eventDate) return false;
    return new Date(`${r.eventDate}T23:59:59`) < now;
  }).length;

  const cancelledCount = registrations.filter((r) => r.status === 'Cancelled').length;

  // Filtered registrations for tabs
  const filteredRegistrations = registrations.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CANCELLED') return r.status === 'Cancelled';

    const isPast = r.eventDate ? new Date(`${r.eventDate}T23:59:59`) < now : false;

    if (activeTab === 'COMPLETED') {
      return r.status !== 'Cancelled' && isPast;
    }
    if (activeTab === 'UPCOMING') {
      return r.status !== 'Cancelled' && !isPast;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roll No: <span className="font-mono font-semibold text-slate-700">{user?.studentId || '2024CS108'}</span> • {user?.department || 'Computer Science'}
            </p>
          </div>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>Browse More Events</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Registered
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalRegistered}</p>
          <p className="text-[11px] text-slate-400">All-time passes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming Events
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{upcomingCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium">Ready for check-in</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{completedCount}</p>
          <p className="text-[11px] text-slate-400">Past attended</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cancelled
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600">{cancelledCount}</p>
          <p className="text-[11px] text-slate-400">Seats released</p>
        </div>
      </div>

      {/* My Registrations Section with Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <span>My Event Registrations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your digital ticket passes, verify venue logistics, or cancel reservations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations List */}
        <div className="p-6">
          {filteredRegistrations.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No registrations found</h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'ALL'
                  ? "You haven't registered for any campus events yet."
                  : `No ${activeTab.toLowerCase()} registrations under this filter.`}
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
              >
                Explore Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => {
                const isCancelled = reg.status === 'Cancelled';
                const isPast = reg.eventDate ? new Date(`${reg.eventDate}T23:59:59`) < now : false;

                return (
                  <div
                    key={reg.id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                      isCancelled
                        ? 'bg-slate-50/60 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    {/* Left: Event Thumbnail & Details */}
                    <div className="flex items-start sm:items-center gap-4">
                      {reg.eventBanner ? (
                        <img
                          src={reg.eventBanner}
                          alt={reg.eventTitle || 'Event'}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Ticket className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={reg.status} size="sm" />
                          <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {reg.registrationId}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {reg.eventTitle || 'Campus Event'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {reg.eventDate ? formatDate(reg.eventDate) : 'Date TBD'}
                          </span>
                          {reg.eventStartTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {formatTime(reg.eventStartTime)}
                            </span>
                          )}
                          {reg.eventVenue && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{reg.eventVenue}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Link
                        to={`/events/${reg.eventId}`}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Event Details
                      </Link>

                      {!isCancelled && (
                        <>
                          <button
                            onClick={() => setSelectedTicket(reg)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>View Pass</span>
                          </button>

                          {!isPast && (
                            <button
                              onClick={() => setCancelTargetReg(reg)}
                              className="px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                              title="Cancel registration"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Pass Modal */}
      <TicketModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        registration={selectedTicket}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(cancelTargetReg)}
        onClose={() => setCancelTargetReg(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Registration?"
        message={`Are you sure you want to cancel your registration for "${cancelTargetReg?.eventTitle || 'this event'}"? Your seat will be released immediately and made available to other students.`}
        confirmLabel="Yes, Cancel Registration"
        cancelLabel="Keep My Seat"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};
