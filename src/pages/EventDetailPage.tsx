import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CampusEvent } from '../types/event';
import { EventRegistration } from '../types/registration';
import { eventService } from '../services/eventService';
import { computeEventStatus, formatDate, formatTime } from '../lib/utils';
import { StatusBadge } from '../components/common/StatusBadge';
import { CapacityIndicator } from '../components/common/CapacityIndicator';
import { RegistrationModal } from '../components/event/RegistrationModal';
import { TicketModal } from '../components/event/TicketModal';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Tag,
  Building,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [ticketData, setTicketData] = useState<EventRegistration | null>(null);

  const fetchEvent = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await eventService.getEventById(id);
      setEvent(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Subscribe to storage changes so remaining seats update live
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      if (id) {
        eventService.getEventById(id).then(setEvent);
      }
    });
    return unsub;
  }, [id]);

  // Check if current user is already registered
  const existingRegistration = React.useMemo(() => {
    if (!id || !user) return null;
    const registrations = storage.getRegistrations();
    return (
      registrations.find(
        (r) =>
          r.eventId === id &&
          (r.studentId === user.id || r.studentEmail.toLowerCase() === user.email.toLowerCase()) &&
          r.status !== 'Cancelled'
      ) || null
    );
  }, [id, user]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Event link copied to clipboard!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500">
          The event you are looking for may have been deleted or the link is invalid.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const statusInfo = computeEventStatus(event);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Hero Banner with Title Overlay */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl">
        <div className="h-72 sm:h-96 w-full relative">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
              {event.category}
            </span>
            <StatusBadge status={statusInfo.badgeLabel} size="md" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400" />
              {event.venue}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Full Description & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">About This Event</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Topics:
                </span>
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Requirements & Prerequisites */}
          {event.requirements && event.requirements.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Prerequisites & What to Bring</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                {event.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer Info Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Organized By
                </p>
                <h4 className="text-sm font-bold text-slate-900">{event.organizerName}</h4>
                <p className="text-xs text-slate-500">{event.organizerEmail}</p>
              </div>
            </div>

            <a
              href={`mailto:${event.organizerEmail}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Organizer</span>
            </a>
          </div>
        </div>

        {/* Right Column: Registration Card (1 Col Sticky) */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Live Seat Status
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Registration Status</h3>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2">
              <CapacityIndicator
                registeredCount={event.registeredCount}
                capacity={event.capacity}
                size="lg"
              />
              <p className="text-xs text-slate-500 text-center font-medium">
                {statusInfo.seatsRemaining} of {event.capacity} seats still available
              </p>
            </div>

            {/* Key Dates Grid */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Registration Closes:</span>
                <span className="font-semibold text-slate-800">
                  {event.registrationClose ? formatDate(event.registrationClose.split('T')[0]) : 'At Capacity'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Registration Fee:</span>
                <span className="font-bold text-emerald-600">Free (Campus Sponsored)</span>
              </div>
            </div>

            {/* Registration CTA Actions */}
            {existingRegistration ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">You are Registered!</p>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    ID: {existingRegistration.registrationId}
                  </p>
                </div>
                <button
                  onClick={() => setTicketData(existingRegistration)}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>View My Digital Ticket Pass</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : statusInfo.isRegisterable ? (
              <div className="space-y-2">
                <button
                  onClick={() => setShowRegModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  <span>Register Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {statusInfo.effectiveStatus === 'Almost Full' && (
                  <p className="text-[11px] text-amber-600 text-center font-semibold">
                    ⚡ Only {statusInfo.seatsRemaining} seats left! Register before it closes.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                  <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                  <p className="text-xs font-bold text-rose-900">{statusInfo.badgeLabel}</p>
                  <p className="text-[11px] text-rose-700">{statusInfo.reason}</p>
                </div>
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed border border-slate-200"
                >
                  Registration Unavailable
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        event={event}
        onSuccess={(reg) => {
          setTicketData(reg);
          fetchEvent();
        }}
      />

      <TicketModal
        isOpen={Boolean(ticketData)}
        onClose={() => setTicketData(null)}
        registration={ticketData}
      />
    </div>
  );
};
