import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampusEvent } from '../../types/event';
import { computeEventStatus, formatDate, formatTime } from '../../lib/utils';
import { StatusBadge } from '../common/StatusBadge';
import { CapacityIndicator } from '../common/CapacityIndicator';
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

interface EventCardProps {
  event: CampusEvent;
  onQuickRegister?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onQuickRegister }) => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const statusInfo = computeEventStatus(event);

  // Check if current logged in student has already registered for this event
  const isAlreadyRegistered = React.useMemo(() => {
    if (!isAuthenticated || !user || user.role !== 'STUDENT') return false;
    const registrations = storage.getRegistrations();
    return registrations.some(
      (r) =>
        r.eventId === event.id &&
        (r.studentId === user.id || r.studentEmail.toLowerCase() === user.email.toLowerCase()) &&
        r.status !== 'Cancelled'
    );
  }, [event.id, user, isAuthenticated]);

  const handleActionClick = (e: React.MouseEvent) => {
    if (isAlreadyRegistered) {
      navigate('/student/dashboard');
      return;
    }

    if (onQuickRegister && statusInfo.isRegisterable) {
      e.preventDefault();
      onQuickRegister(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Banner Image with Status Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
            {event.category}
          </span>
          <StatusBadge status={statusInfo.badgeLabel} size="sm" />
        </div>

        {/* Bottom date badge overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium flex items-center gap-1.5 drop-shadow">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            {formatDate(event.date)}
          </span>
          <span className="font-medium flex items-center gap-1.5 drop-shadow">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            {formatTime(event.startTime)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/events/${event.id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="pt-2 border-t border-slate-100">
          <CapacityIndicator
            registeredCount={event.registeredCount}
            capacity={event.capacity}
            size="sm"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <Link
            to={`/events/${event.id}`}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition py-2"
          >
            View Details
          </Link>

          {isAlreadyRegistered ? (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Registered
            </button>
          ) : statusInfo.isRegisterable ? (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm group-hover:shadow-md"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled
              title={statusInfo.reason}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            >
              {statusInfo.effectiveStatus === 'Cancelled'
                ? 'Cancelled'
                : statusInfo.effectiveStatus === 'Completed'
                ? 'Ended'
                : statusInfo.effectiveStatus === 'Draft'
                ? 'Coming Soon'
                : 'Closed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
