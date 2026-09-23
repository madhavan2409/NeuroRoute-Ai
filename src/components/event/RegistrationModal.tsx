import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CampusEvent } from '../../types/event';
import { EventRegistration, RegistrationFormData } from '../../types/registration';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { computeEventStatus, formatDate, formatTime } from '../../lib/utils';
import { Calendar, Clock, MapPin, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  onSuccess: (registration: EventRegistration) => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Civil Engineering',
  'Management Studies / MBA',
  'Applied Sciences & Humanities',
  'Design & Fine Arts',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post-Graduate / Masters', 'PhD Scholar'];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<RegistrationFormData>({
    studentName: '',
    studentEmail: '',
    studentRollNo: '',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user data when opened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (user) {
        setFormData({
          studentName: user.name || '',
          studentEmail: user.email || '',
          studentRollNo: user.studentId || '2024CS108',
          department: user.department || 'Computer Science & Engineering',
          year: user.year || '3rd Year',
          phone: user.phone || '9876543210',
        });
      } else {
        setFormData({
          studentName: '',
          studentEmail: '',
          studentRollNo: '',
          department: 'Computer Science & Engineering',
          year: '3rd Year',
          phone: '',
        });
      }
    }
  }, [isOpen, user]);

  if (!event) return null;

  const statusInfo = computeEventStatus(event);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend checks
    if (!formData.studentName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.studentEmail.trim() || !formData.studentEmail.includes('@')) {
      setError('Please provide a valid university email address.');
      return;
    }
    if (!formData.studentRollNo.trim()) {
      setError('Please provide your official Student ID / Roll Number.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const studentId = user?.id || `student_${Date.now()}`;
      const registration = await registrationService.registerForEvent(
        event.id,
        studentId,
        formData
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore in tests
      }

      showToast(`Registration Confirmed! Ticket ID: ${registration.registrationId}`, 'success', 5000);
      onSuccess(registration);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register for Event" maxWidth="lg">
      <div className="space-y-5">
        {/* Event Quick Info Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {event.category}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">{event.title}</h4>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {statusInfo.seatsRemaining} seats left
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-600 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:col-span-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-slide-up">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                University Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.studentEmail}
                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                placeholder="student@campus.edu"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Student ID */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Student ID / Roll No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentRollNo}
                onChange={(e) => setFormData({ ...formData, studentRollNo: e.target.value })}
                placeholder="e.g. 2024CS108"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Year of Study */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
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
              disabled={isSubmitting || !statusInfo.isRegisterable}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Seat...' : 'Confirm Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
