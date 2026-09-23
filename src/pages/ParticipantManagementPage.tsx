import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CampusEvent } from '../types/event';
import { EventRegistration, RegistrationStatus } from '../types/registration';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { storage } from '../services/storage';
import { StatusBadge } from '../components/common/StatusBadge';
import { CapacityIndicator } from '../components/common/CapacityIndicator';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useToast } from '../context/ToastContext';
import { downloadCSV, formatDate, formatTime } from '../lib/utils';
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ParticipantManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [participants, setParticipants] = useState<EventRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const [cancelTarget, setCancelTarget] = useState<EventRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    if (!id) return;
    const evt = await eventService.getEventById(id);
    setEvent(evt);
    const regs = await registrationService.getEventParticipants(id);
    setParticipants(regs);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Subscribe to storage
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      loadData();
    });
    return unsub;
  }, [id]);

  const handleStatusChange = async (regId: string, newStatus: RegistrationStatus) => {
    try {
      await registrationService.updateRegistrationStatus(regId, newStatus);
      showToast(`Participant status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setIsUpdating(true);
      await registrationService.cancelRegistration(cancelTarget.id);
      showToast(`Registration for ${cancelTarget.studentName} has been cancelled.`, 'info');
      setCancelTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (!event || participants.length === 0) {
      showToast('No participants to export.', 'warning');
      return;
    }

    const rows = participants.map((p) => ({
      'Registration ID': p.registrationId,
      'Student Name': p.studentName,
      'Student Roll No': p.studentRollNo,
      'Email Address': p.studentEmail,
      'Department': p.department,
      'Year of Study': p.year,
      'Contact Phone': p.phone,
      'Registered At': p.registeredAt ? new Date(p.registeredAt).toLocaleString() : '',
      'Status': p.status,
    }));

    const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Participants.csv`;
    downloadCSV(filename, rows);
    showToast(`Exported ${participants.length} participant records to ${filename}`, 'success');
  };

  // Get distinct departments from participants for filtering
  const departments = Array.from(new Set(participants.map((p) => p.department).filter(Boolean)));

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registrationId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || p.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-slate-500">Event not found.</p>
        <Link to="/organizer/events" className="text-indigo-600 font-semibold text-xs">
          ← Back to Event Manager
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Manager</span>
        </Link>
      </div>

      {/* Event Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
              {event.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{formatDate(event.date)}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-xs text-slate-500">{event.venue}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 min-w-[200px]">
            <CapacityIndicator
              registeredCount={event.registeredCount}
              capacity={event.capacity}
              size="md"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, email, or registration ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter participant status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Registered">Registered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px] truncate"
            aria-label="Filter department"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Registered Participants ({filteredParticipants.length})</span>
          </h3>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No registered participants match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Attendee</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    {/* Attendee Name & Email */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-400">{p.studentEmail}</div>
                    </td>

                    {/* Student Roll No */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {p.studentRollNo}
                      </span>
                    </td>

                    {/* Department & Year */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[180px]" title={p.department}>
                        {p.department}
                      </div>
                      <div className="text-[11px] text-slate-400">{p.year}</div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono">
                      {p.phone}
                    </td>

                    {/* Ticket ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {p.registrationId}
                      </span>
                    </td>

                    {/* Status & Inline changer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as RegistrationStatus)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Registered">Registered</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      {p.status !== 'Cancelled' && (
                        <button
                          onClick={() => setCancelTarget(p)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition"
                        >
                          Cancel Seat
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Participant Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Participant Registration?"
        message={`Are you sure you want to cancel the registration for ${cancelTarget?.studentName} (${cancelTarget?.registrationId})? Their seat will be released immediately.`}
        confirmLabel="Yes, Cancel Seat"
        cancelLabel="Keep Registration"
        variant="danger"
        isLoading={isUpdating}
      />
    </div>
  );
};
