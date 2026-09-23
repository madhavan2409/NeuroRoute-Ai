import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CampusEvent, EventStatus } from '../types/event';
import { eventService } from '../services/eventService';
import { storage } from '../services/storage';
import { StatusBadge } from '../components/common/StatusBadge';
import { CapacityIndicator } from '../components/common/CapacityIndicator';
import { EventFormModal } from '../components/organizer/EventFormModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime } from '../lib/utils';
import {
  Calendar,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

export const OrganizerEventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);

  const [deleteTargetEvent, setDeleteTargetEvent] = useState<CampusEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvents = async () => {
    const all = storage.getEvents();
    setEvents(all);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Check if URL has ?action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setEditingEvent(null);
      setIsFormModalOpen(true);
    }
  }, [searchParams]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      loadEvents();
    });
    return unsub;
  }, []);

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      showToast(`Event status updated to "${newStatus}"`, 'success');
      loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetEvent) return;
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(deleteTargetEvent.id);
      showToast(`Event "${deleteTargetEvent.title}" deleted.`, 'info');
      setDeleteTargetEvent(null);
      loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Event Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit, change registration statuses, and inspect participant rosters.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, venue, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Registration Open">Registration Open</option>
            <option value="Almost Full">Almost Full</option>
            <option value="Registration Closed">Registration Closed</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table for Desktop / Adaptive Cards for Mobile */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No events found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Venue</th>
                  <th className="py-4 px-4 min-w-[140px]">Capacity</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition">
                    {/* Event Col */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={evt.bannerUrl}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/events/${evt.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition block truncate max-w-xs"
                          >
                            {evt.title}
                          </Link>
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {evt.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date Col */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{formatDate(evt.date)}</div>
                      <div className="text-[11px] text-slate-400">
                        {formatTime(evt.startTime)} - {formatTime(evt.endTime)}
                      </div>
                    </td>

                    {/* Venue Col */}
                    <td className="py-4 px-4">
                      <span className="text-slate-600 max-w-[180px] truncate block" title={evt.venue}>
                        {evt.venue}
                      </span>
                    </td>

                    {/* Capacity Col */}
                    <td className="py-4 px-4">
                      <CapacityIndicator
                        registeredCount={evt.registeredCount}
                        capacity={evt.capacity}
                        size="sm"
                      />
                    </td>

                    {/* Status Col & Selector */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={evt.status}
                        onChange={(e) => handleStatusChange(evt.id, e.target.value as EventStatus)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Registration Open">Registration Open</option>
                        <option value="Almost Full">Almost Full</option>
                        <option value="Registration Closed">Registration Closed</option>
                        <option value="Completed">Completed</option>
                        <option value="Draft">Draft</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions Col */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/organizer/events/${evt.id}/participants`}
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                          title="View Registered Participants"
                        >
                          <Users className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingEvent(evt);
                            setIsFormModalOpen(true);
                          }}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetEvent(evt)}
                          className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        eventToEdit={editingEvent}
        onSaved={() => loadEvents()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTargetEvent)}
        onClose={() => setDeleteTargetEvent(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Campus Event?"
        message={`Are you sure you want to permanently delete "${deleteTargetEvent?.title}"? All participant associations and bookings for this event will be removed.`}
        confirmLabel="Yes, Delete Event"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
