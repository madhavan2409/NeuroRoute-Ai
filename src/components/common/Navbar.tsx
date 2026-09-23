import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Compass,
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  LogOut,
  LogIn,
  Menu,
  X,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, isDemoMode, logout, switchDemoRole } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleToggle = (targetRole: 'STUDENT' | 'ORGANIZER') => {
    switchDemoRole(targetRole);
    showToast(`Switched active view to ${targetRole === 'ORGANIZER' ? 'Organizer' : 'Student'} mode`, 'info');
    if (targetRole === 'ORGANIZER') {
      navigate('/organizer/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Demo Mode Quick Switcher Bar */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-200">
                Hackathon Demo Mode Active (Zero Setup Required)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300 hidden sm:inline">Quick Switch Role:</span>
              <button
                onClick={() => handleRoleToggle('STUDENT')}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition ${
                  role === 'STUDENT'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-indigo-950/80 text-slate-300 hover:bg-indigo-700/60'
                }`}
              >
                🎓 Student
              </button>
              <button
                onClick={() => handleRoleToggle('ORGANIZER')}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition ${
                  role === 'ORGANIZER'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-indigo-950/80 text-slate-300 hover:bg-indigo-700/60'
                }`}
              >
                🏛️ Organizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-600 bg-clip-text text-transparent">
                  EventHub
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 ml-1.5 px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                  Campus
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/events"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/events')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Explore Events
              </Link>

              {isAuthenticated && role === 'STUDENT' && (
                <Link
                  to="/student/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/student/dashboard')
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  My Registrations
                </Link>
              )}

              {isAuthenticated && role === 'ORGANIZER' && (
                <>
                  <Link
                    to="/organizer/dashboard"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/organizer/dashboard')
                        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Overview
                  </Link>
                  <Link
                    to="/organizer/events"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/organizer/events')
                        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Manage Events
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {role === 'ORGANIZER' && (
              <Link
                to="/organizer/events?action=create"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Create Event
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
                      {user.role}
                    </p>
                  </div>
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {user.role === 'ORGANIZER' ? '🏛️ Event Organizer' : '🎓 Student Account'}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'STUDENT' ? (
                        <Link
                          to="/student/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <CalendarCheck className="w-4 h-4 text-slate-400" />
                          My Registrations
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/organizer/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Organizer Analytics
                          </Link>
                          <Link
                            to="/organizer/events"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Manage Events
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold text-indigo-600 uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Compass className="w-5 h-5 text-slate-500" />
              Explore Events
            </Link>

            {isAuthenticated && role === 'STUDENT' && (
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <CalendarCheck className="w-5 h-5 text-slate-500" />
                My Registrations
              </Link>
            )}

            {isAuthenticated && role === 'ORGANIZER' && (
              <>
                <Link
                  to="/organizer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-500" />
                  Organizer Analytics
                </Link>
                <Link
                  to="/organizer/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Calendar className="w-5 h-5 text-slate-500" />
                  Manage Events
                </Link>
                <Link
                  to="/organizer/events?action=create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50"
                >
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  Create New Event
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
