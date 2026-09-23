import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CampusEvent, EventCategory, EventStatus } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventService } from '../../services/eventService';
import { AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CampusEvent | null;
  onSaved: (event: CampusEvent) => void;
}

const CATEGORIES: EventCategory[] = [
  'Technology',
  'Workshop',
  'Hackathon',
  'Cultural',
  'Sports',
  'Career',
  'Academic',
  'Seminar',
];

const STATUS_OPTIONS: EventStatus[] = [
  'Draft',
  'Registration Open',
  'Almost Full',
  'Registration Closed',
  'Completed',
  'Cancelled',
];

const PRESET_BANNERS = [
  {
    name: 'Tech Conference',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'AI Workshop',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hackathon Coding',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Robotics',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Startup Pitch',
    url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
  },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSaved,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technology');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState<number>(100);
  const [registrationOpen, setRegistrationOpen] = useState('');
  const [registrationClose, setRegistrationClose] = useState('');
  const [status, setStatus] = useState<EventStatus>('Registration Open');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setCategory(eventToEdit.category);
        setDescription(eventToEdit.description);
        setBannerUrl(eventToEdit.bannerUrl);
        setDate(eventToEdit.date);
        setStartTime(eventToEdit.startTime);
        setEndTime(eventToEdit.endTime);
        setVenue(eventToEdit.venue);
        setCapacity(eventToEdit.capacity);
        setRegistrationOpen(eventToEdit.registrationOpen ? eventToEdit.registrationOpen.split('T')[0] : '');
        setRegistrationClose(eventToEdit.registrationClose ? eventToEdit.registrationClose.split('T')[0] : '');
        setStatus(eventToEdit.status);
      } else {
        // Defaults for new event
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14); // 2 weeks ahead
        const dateStr = defaultDate.toISOString().split('T')[0];

        const openDate = new Date();
        const openStr = openDate.toISOString().split('T')[0];

        const closeDate = new Date(defaultDate);
        closeDate.setDate(closeDate.getDate() - 2);
        const closeStr = closeDate.toISOString().split('T')[0];

        setTitle('');
        setCategory('Technology');
        setDescription('');
        setBannerUrl(PRESET_BANNERS[0].url);
        setDate(dateStr);
        setStartTime('10:00');
        setEndTime('16:00');
        setVenue('Main Campus Auditorium');
        setCapacity(100);
        setRegistrationOpen(openStr);
        setRegistrationClose(closeStr);
        setStatus('Registration Open');
      }
    }
  }, [isOpen, eventToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide an event description.');
      return;
    }
    if (!venue.trim()) {
      setError('Please provide a venue or meeting location.');
      return;
    }
    if (!date) {
      setError('Please select an event date.');
      return;
    }
    if (capacity <= 0) {
      setError('Maximum capacity must be greater than 0.');
      return;
    }

    if (registrationOpen && registrationClose && new Date(registrationOpen) > new Date(registrationClose)) {
      setError('Registration opening date cannot be after closing date.');
      return;
    }

    try {
      setIsSubmitting(true);

      const eventPayload = {
        organizerId: user?.id || 'usr_organizer_01',
        organizerName: user?.name || 'Prof. Ananya Iyer',
        organizerEmail: user?.email || 'organizer@demo.com',
        title: title.trim(),
        category,
        description: description.trim(),
        bannerUrl: bannerUrl.trim() || PRESET_BANNERS[0].url,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        capacity: Number(capacity),
        registrationOpen: registrationOpen ? `${registrationOpen}T00:00:00Z` : new Date().toISOString(),
        registrationClose: registrationClose ? `${registrationClose}T23:59:59Z` : `${date}T23:59:59Z`,
        status,
      };

      let result: CampusEvent;
      if (eventToEdit) {
        result = await eventService.updateEvent(eventToEdit.id, eventPayload);
        showToast('Event details updated successfully!', 'success');
      } else {
        result = await eventService.createEvent(eventPayload);
        showToast('New event created and published!', 'success');
      }

      onSaved(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event.');
      showToast(err.message || 'Failed to save event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Edit Event Details' : 'Create New Campus Event'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Event Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. National Tech Symposium 2026"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Event Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive description of agenda, requirements, guest speakers, prerequisites..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Banner URL & Preset selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Event Banner Image</span>
            <span className="text-[11px] font-normal text-slate-400">Select preset or enter URL</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Presets:</span>
            {PRESET_BANNERS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setBannerUrl(preset.url)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                  bannerUrl === preset.url
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Venue & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Venue / Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Auditorium, Lab 3, Quad..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Max Capacity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={5000}
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Registration Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Registration Opens</label>
            <input
              type="date"
              value={registrationOpen}
              onChange={(e) => setRegistrationOpen(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Registration Closes</label>
            <input
              type="date"
              value={registrationClose}
              onChange={(e) => setRegistrationClose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Event...' : eventToEdit ? 'Save Changes' : 'Publish Event'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
