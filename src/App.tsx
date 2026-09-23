import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/OrganizerEventsPage';
import { ParticipantManagementPage } from './pages/ParticipantManagementPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<EventDiscoveryPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <StudentDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Organizer Protected Routes */}
                <Route
                  path="/organizer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER']}>
                      <OrganizerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/events"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER']}>
                      <OrganizerEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer/events/:id/participants"
                  element={
                    <ProtectedRoute allowedRoles={['ORGANIZER']}>
                      <ParticipantManagementPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
