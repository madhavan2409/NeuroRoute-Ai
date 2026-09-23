import React from 'react';
import { Modal } from '../common/Modal';
import { EventRegistration } from '../../types/registration';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatTime } from '../../lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: EventRegistration | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  registration,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!registration) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.registrationId);
    showToast(`Registration ID ${registration.registrationId} copied to clipboard!`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6">
        {/* Ticket Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Registration Confirmed!</h3>
          <p className="text-xs text-slate-500">
            Present this digital boarding pass at the venue registration desk.
          </p>
        </div>

        {/* Digital Boarding Pass Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-indigo-800/40">
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />

          {/* Top Pass Row */}
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-indigo-300">
                Official Campus Event Pass
              </span>
              <p className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                {registration.registrationId}
                <button
                  onClick={handleCopyId}
                  title="Copy Ticket ID"
                  className="text-slate-400 hover:text-white transition"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </p>
            </div>
            <StatusBadge status={registration.status} size="sm" />
          </div>

          {/* Event Info */}
          <div className="space-y-3 mb-5">
            <h4 className="text-base font-bold text-white leading-tight">
              {registration.eventTitle || 'Campus Event'}
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{registration.eventDate ? formatDate(registration.eventDate) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{registration.eventStartTime ? formatTime(registration.eventStartTime) : 'TBD'}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 truncate text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{registration.eventVenue || 'Campus Venue'}</span>
              </div>
            </div>
          </div>

          {/* Student Pass Details & Simulated QR Code */}
          <div className="pt-3 border-t border-dashed border-indigo-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <p className="text-[11px] text-indigo-300 font-medium">Attendee</p>
              <p className="font-bold text-white">{registration.studentName}</p>
              <p className="text-[11px] text-slate-400 font-mono">ID: {registration.studentRollNo}</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {registration.department}
              </p>
            </div>

            {/* QR Code SVG Simulation */}
            <div className="p-2 bg-white rounded-xl shadow-md shrink-0 flex flex-col items-center">
              <QrCode className="w-16 h-16 text-slate-900" />
              <span className="text-[8px] font-mono font-bold text-slate-700 mt-0.5">SCAN PASS</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Save / Print Ticket</span>
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/student/dashboard');
            }}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <span>My Registrations</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
