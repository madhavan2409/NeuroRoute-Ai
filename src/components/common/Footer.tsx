import React from 'react';
import { Calendar, Shield, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">EventHub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering university student organizations and participants with frictionless event discovery, real-time capacity management, and digital ticketing.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All campus systems operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition">All Campus Events</Link>
              </li>
              <li>
                <Link to="/events?category=Hackathon" className="hover:text-white transition">Hackathons & Competitions</Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-white transition">Hands-on Workshops</Link>
              </li>
              <li>
                <Link to="/events?category=Technology" className="hover:text-white transition">Tech Symposiums</Link>
              </li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Organizers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/organizer/events?action=create" className="hover:text-white transition">Host an Event</Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="hover:text-white transition">Organizer Analytics</Link>
              </li>
              <li>
                <Link to="/organizer/events" className="hover:text-white transition">Capacity & Attendance</Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">Organizer Guidelines</a>
              </li>
            </ul>
          </div>

          {/* Hackathon Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Hackathon Project
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              PS06 – Event Registration System. Architected with React, TypeScript, Tailwind CSS, and Supabase.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] space-y-1">
              <p className="font-semibold text-slate-300">Quick Test Credentials:</p>
              <p className="text-slate-400">Student: <code className="text-indigo-300">student@demo.com</code></p>
              <p className="text-slate-400">Organizer: <code className="text-amber-300">organizer@demo.com</code></p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} EventHub Campus System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Built with precision for PS06</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for campus innovators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
