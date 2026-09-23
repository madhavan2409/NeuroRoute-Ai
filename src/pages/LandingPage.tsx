import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampusEvent } from '../types/event';
import { EventRegistration } from '../types/registration';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/event/EventCard';
import { RegistrationModal } from '../components/event/RegistrationModal';
import { TicketModal } from '../components/event/TicketModal';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
  CheckCircle,
  HelpCircle,
  Award,
  Zap,
  BarChart3,
  Ticket,
  ChevronDown,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { role, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [featuredEvents, setFeaturedEvents] = useState<CampusEvent[]>([]);
  const [selectedEventForReg, setSelectedEventForReg] = useState<CampusEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<EventRegistration | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    eventService.getAllEvents().then((events) => {
      // Pick top 3-4 open/featured events
      setFeaturedEvents(events.slice(0, 3));
    });
  }, []);

  const handleLaunchStudent = () => {
    switchDemoRole('STUDENT');
    navigate('/events');
  };

  const handleLaunchOrganizer = () => {
    switchDemoRole('ORGANIZER');
    navigate('/organizer/dashboard');
  };

  const faqs = [
    {
      q: 'How does event capacity and seat reservation work?',
      a: 'EventHub features live real-time capacity management. When you submit your registration, available seats are immediately locked and decremented. If an event reaches capacity, the system automatically marks it as Full and closes registrations to prevent overbooking.',
    },
    {
      q: 'Can a student register twice for the same event?',
      a: 'No. The system strictly validates student email and student roll numbers against the active participant registry. Duplicate attempts are prevented with an explicit warning showing your existing Registration ID.',
    },
    {
      q: 'What happens if I need to cancel my registration?',
      a: 'Students can effortlessly cancel any upcoming registration directly from their Student Dashboard. Cancelling immediately frees up your seat for other waiting students and updates the event capacity counter.',
    },
    {
      q: 'How do organizers manage registered participants and export data?',
      a: 'Organizers have a dedicated Participant Management view where they can search, filter by department or status, update attendance records, and export a clean CSV spreadsheet with a single click.',
    },
    {
      q: 'Does EventHub support both offline demo mode and Supabase production?',
      a: 'Yes! EventHub is architected with dual-mode storage. It works completely out of the box with zero setup using local state, while seamlessly connecting to Supabase PostgreSQL and Auth when environment variables are supplied.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200/60">
        {/* Ambient subtle glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-300/30 to-violet-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>PS06 • Campus Event Registration Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Discover. <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Register.</span> Experience.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            One platform for discovering campus events, managing registrations, and connecting students with opportunities.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 group"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/organizer/events?action=create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Create an Event</span>
            </Link>
          </div>

          {/* Hackathon Demo Launcher Pill Bar */}
          <div className="mt-12 p-3.5 rounded-2xl bg-white/80 border border-slate-200 shadow-md backdrop-blur-md max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Live Hackathon Evaluator Shortcuts</p>
                <p className="text-[11px] text-slate-500">Test the complete flow in 1-click</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleLaunchStudent}
                className="flex-1 sm:flex-initial text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Launch as Student
              </button>
              <button
                onClick={handleLaunchOrganizer}
                className="flex-1 sm:flex-initial text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
              >
                Launch as Organizer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">10+</p>
            <p className="text-xs text-slate-400 font-medium">Campus Events Listed</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">500+</p>
            <p className="text-xs text-slate-400 font-medium">Student Registrations</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">100%</p>
            <p className="text-xs text-slate-400 font-medium">Real-Time Seat Accuracy</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">0s</p>
            <p className="text-xs text-slate-400 font-medium">Instant Ticket Generation</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Campus Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Events Open for Registration
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Discover top technical symposiums, hackathons, and certified workshops happening soon.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group shrink-0"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onQuickRegister={(evt) => setSelectedEventForReg(evt)}
            />
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Streamlined Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How It Works</h2>
            <p className="text-sm text-slate-600">
              Simple 3-step experience designed for maximum campus engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Browse & Discover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by technical domain, upcoming dates, and open seat availability. Check agendas, speaker bios, and venue locations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant One-Click Registration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fill the verified student registration form. The system reserves your seat atomically, preventing overbooking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Boarding Pass & QR</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get an instant unique ticket ID (`REG-2026-XXXX`). Present your digital pass for fast check-in at the venue desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Benefits for Students & Organizers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Benefits Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">For Students</h3>
                <p className="text-xs text-slate-500">Effortless discovery & guaranteed seats</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Real-time seat counter prevents showing up to overcrowded venues</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Personalized student dashboard tracking upcoming and past registrations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant QR-code digital ticket pass with unique registration code</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Self-service registration cancellation that restores available seats</span>
              </li>
            </ul>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Explore campus opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Organizer Benefits Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">For Campus Organizers</h3>
                <p className="text-xs text-slate-400">Total control over registration & capacity</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Automated capacity enforcement: stops registrations automatically at limit</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Visual analytics with Recharts for attendance breakdown & trend tracking</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Searchable participant table with status updates (Confirmed/Cancelled)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>One-click CSV export ready for certificates and venue gate security</span>
              </li>
            </ul>

            <Link
              to="/organizer/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <span>Open Organizer Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to know about EventHub's validation, roles, and capacity system.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals for Quick Register & Ticket */}
      <RegistrationModal
        isOpen={Boolean(selectedEventForReg)}
        onClose={() => setSelectedEventForReg(null)}
        event={selectedEventForReg}
        onSuccess={(reg) => {
          setActiveTicket(reg);
          // Refresh list to update seat counters
          eventService.getAllEvents().then((evts) => setFeaturedEvents(evts.slice(0, 3)));
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
