import { storage } from './storage';
import { CampusEvent, EventFilterOptions, EventStatus } from '../types/event';
import { computeEventStatus } from '../lib/utils';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const eventService = {
  async getAllEvents(filters?: EventFilterOptions): Promise<CampusEvent[]> {
    // If Supabase is configured and reachable, we could query it, otherwise storage handles demo
    let events = storage.getEvents();

    if (!filters) return events;

    const { searchQuery, category, dateFilter, availability, sortBy } = filters;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizerName.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'ALL') {
      events = events.filter((e) => e.category === category);
    }

    if (dateFilter && dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      events = events.filter((e) => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'TODAY') {
          return eventDate.getTime() === today.getTime();
        } else if (dateFilter === 'THIS_WEEK') {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
          return eventDate >= today && eventDate <= endOfWeek;
        } else if (dateFilter === 'THIS_MONTH') {
          return (
            eventDate.getFullYear() === today.getFullYear() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate >= today
          );
        } else if (dateFilter === 'UPCOMING') {
          return eventDate >= today;
        }
        return true;
      });
    }

    if (availability && availability !== 'ALL') {
      events = events.filter((e) => {
        const computed = computeEventStatus(e);
        if (availability === 'OPEN_ONLY') {
          return computed.isRegisterable;
        } else if (availability === 'HAS_SEATS') {
          return computed.seatsRemaining > 0;
        }
        return true;
      });
    }

    if (sortBy) {
      events = [...events].sort((a, b) => {
        if (sortBy === 'DATE_ASC') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'DATE_DESC') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === 'POPULARITY') {
          return b.registeredCount - a.registeredCount;
        } else if (sortBy === 'SEATS_LEFT') {
          const leftA = Math.max(0, a.capacity - a.registeredCount);
          const leftB = Math.max(0, b.capacity - b.registeredCount);
          return leftA - leftB;
        } else if (sortBy === 'TITLE_ASC') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }

    return events;
  },

  async getEventById(id: string): Promise<CampusEvent | null> {
    const events = storage.getEvents();
    return events.find((e) => e.id === id) || null;
  },

  async createEvent(
    eventData: Omit<CampusEvent, 'id' | 'createdAt' | 'registeredCount'>
  ): Promise<CampusEvent> {
    const events = storage.getEvents();
    const newEvent: CampusEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    storage.saveEvents(events);

    // If Supabase configured, attempt sync in background
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('events')
        .insert([
          {
            id: newEvent.id,
            organizer_id: newEvent.organizerId,
            title: newEvent.title,
            category: newEvent.category,
            description: newEvent.description,
            banner_url: newEvent.bannerUrl,
            date: newEvent.date,
            start_time: newEvent.startTime,
            end_time: newEvent.endTime,
            venue: newEvent.venue,
            capacity: newEvent.capacity,
            registration_open: newEvent.registrationOpen,
            registration_close: newEvent.registrationClose,
            status: newEvent.status,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('Supabase sync notice:', error.message);
        });
    }

    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<CampusEvent>): Promise<CampusEvent> {
    const events = storage.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Event with ID ${id} not found.`);
    }

    const updatedEvent = { ...events[index], ...updates };
    events[index] = updatedEvent;
    storage.saveEvents(events);

    return updatedEvent;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const events = storage.getEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;

    storage.saveEvents(filtered);
    return true;
  },

  async updateEventStatus(id: string, status: EventStatus): Promise<CampusEvent> {
    return this.updateEvent(id, { status });
  },

  async getOrganizerStats(organizerId?: string) {
    let events = storage.getEvents();
    if (organizerId) {
      events = events.filter((e) => e.organizerId === organizerId);
    }
    const registrations = storage.getRegistrations();

    const totalEvents = events.length;
    const now = new Date();

    let activeEvents = 0;
    let upcomingEvents = 0;
    let completedEvents = 0;

    events.forEach((e) => {
      const computed = computeEventStatus(e);
      if (computed.effectiveStatus === 'Completed') {
        completedEvents++;
      } else if (computed.effectiveStatus === 'Registration Open' || computed.effectiveStatus === 'Almost Full') {
        activeEvents++;
      }

      const evtDate = new Date(`${e.date}T${e.startTime || '00:00'}`);
      if (evtDate > now && e.status !== 'Cancelled') {
        upcomingEvents++;
      }
    });

    // Active non-cancelled registrations count
    const totalRegistrations = registrations.filter((r) => r.status !== 'Cancelled').length;

    // Chart Data: Registrations vs Capacity per Event (Top 6)
    const registrationsPerEvent = events.slice(0, 6).map((e) => ({
      name: e.title.length > 18 ? e.title.slice(0, 18) + '...' : e.title,
      fullName: e.title,
      registered: e.registeredCount,
      capacity: e.capacity,
      remaining: Math.max(0, e.capacity - e.registeredCount),
    }));

    // Chart Data: Category Distribution
    const categoryCounts: Record<string, number> = {};
    events.forEach((e) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + e.registeredCount;
    });
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Chart Data: Registration Trends
    const trendMap: Record<string, number> = {};
    registrations.forEach((r) => {
      const day = r.registeredAt ? r.registeredAt.split('T')[0] : '2026-09-18';
      trendMap[day] = (trendMap[day] || 0) + 1;
    });

    const trendData = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => {
        const [_, m, d] = date.split('-');
        return {
          date: `${m}/${d}`,
          registrations: count,
        };
      });

    return {
      totalEvents,
      activeEvents,
      totalRegistrations,
      upcomingEvents,
      completedEvents,
      registrationsPerEvent,
      categoryData,
      trendData,
    };
  },
};
