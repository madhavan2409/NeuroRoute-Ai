import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CampusEvent, EventCategory, EventFilterOptions } from '../types/event';
import { EventRegistration } from '../types/registration';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/event/EventCard';
import { EventFilterBar } from '../components/event/EventFilterBar';
import { RegistrationModal } from '../components/event/RegistrationModal';
import { TicketModal } from '../components/event/TicketModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { Compass, Sparkles, Inbox, RotateCcw } from 'lucide-react';
import { storage } from '../services/storage';

export const EventDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventForReg, setSelectedEventForReg] = useState<CampusEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<EventRegistration | null>(null);

  // Initialize filters from query params if any
  const [filters, setFilters] = useState<EventFilterOptions>({
    searchQuery: searchParams.get('q') || '',
    category: (searchParams.get('category') as EventCategory) || 'ALL',
    dateFilter: 'ALL',
    availability: 'ALL',
    sortBy: 'DATE_ASC',
  });

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAllEvents(filters);
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filters]);

  // Subscribe to storage changes so card seats reflect registrations immediately
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      loadEvents();
    });
    return unsub;
  }, []);

  const handleFilterChange = (newFilters: EventFilterOptions) => {
    setFilters(newFilters);
    // sync category to URL params
    if (newFilters.category && newFilters.category !== 'ALL') {
      setSearchParams({ category: newFilters.category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus Event Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover Campus Events & Workshops
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Find technical hackathons, coding duels, guest seminars, and student club meetups. Register early to guarantee your seat before capacity is reached.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <EventFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalResults={events.length}
      />

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No events found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No campus events match your current search and filter criteria. Try adjusting your filters or search terms.
            </p>
          </div>
          <button
            onClick={() =>
              handleFilterChange({
                searchQuery: '',
                category: 'ALL',
                dateFilter: 'ALL',
                availability: 'ALL',
                sortBy: 'DATE_ASC',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onQuickRegister={(evt) => setSelectedEventForReg(evt)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RegistrationModal
        isOpen={Boolean(selectedEventForReg)}
        onClose={() => setSelectedEventForReg(null)}
        event={selectedEventForReg}
        onSuccess={(reg) => {
          setActiveTicket(reg);
          loadEvents();
        }}
      />

      <TicketModal
        isOpen={Boolean(activeTicket)}
        onClose={() => setActiveTicket(null)}
        registration={activeTicket}
      />
    </div>
  );
};
