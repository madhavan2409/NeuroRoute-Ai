import { storage } from './storage';
import { DEMO_USERS } from '../data/mockData';
import { UserProfile, UserRole } from '../types/user';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const authService = {
  getCurrentUser(): UserProfile | null {
    return storage.getCurrentUser();
  },

  async login(email: string, _password?: string): Promise<UserProfile> {
    const cleanEmail = email.toLowerCase().trim();

    // Check if matches demo organizer
    if (cleanEmail === 'organizer@demo.com') {
      const user = DEMO_USERS.organizer;
      storage.saveCurrentUser(user);
      return user;
    }

    // Check if matches demo student
    if (cleanEmail === 'student@demo.com') {
      const user = DEMO_USERS.student;
      storage.saveCurrentUser(user);
      return user;
    }

    // If Supabase is configured
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: _password || 'demo123456',
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data?.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
          role: data.user.user_metadata?.role || 'STUDENT',
          studentId: data.user.user_metadata?.studentId,
          department: data.user.user_metadata?.department,
          year: data.user.user_metadata?.year,
          phone: data.user.user_metadata?.phone,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        storage.saveCurrentUser(profile);
        return profile;
      }
    }

    // Fallback: Create dynamic profile based on email
    const isOrg = cleanEmail.includes('organizer') || cleanEmail.includes('prof') || cleanEmail.includes('admin');
    const dynamicUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: isOrg ? 'ORGANIZER' : 'STUDENT',
      studentId: isOrg ? undefined : `2024CS${Math.floor(100 + Math.random() * 900)}`,
      department: isOrg ? 'Department of Computer Science' : 'Computer Science & Engineering',
      year: isOrg ? undefined : '3rd Year',
      phone: '9876543210',
      createdAt: new Date().toISOString(),
    };

    storage.saveCurrentUser(dynamicUser);
    return dynamicUser;
  },

  async signup(profileData: {
    email: string;
    name: string;
    role: UserRole;
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
    password?: string;
  }): Promise<UserProfile> {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: profileData.email.toLowerCase().trim(),
      name: profileData.name.trim(),
      role: profileData.role,
      studentId: profileData.studentId?.trim(),
      department: profileData.department?.trim(),
      year: profileData.year?.trim(),
      phone: profileData.phone?.trim(),
      createdAt: new Date().toISOString(),
    };

    // If Supabase configured, attempt signup
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: profileData.password || 'password123',
        options: {
          data: {
            name: newUser.name,
            role: newUser.role,
            studentId: newUser.studentId,
            department: newUser.department,
            year: newUser.year,
            phone: newUser.phone,
          },
        },
      });
      if (error) {
        console.warn('Supabase auth signup notice:', error.message);
      }
    }

    storage.saveCurrentUser(newUser);
    return newUser;
  },

  logout(): void {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    storage.saveCurrentUser(null);
  },

  switchDemoRole(role: UserRole): UserProfile {
    const user = role === 'ORGANIZER' ? DEMO_USERS.organizer : DEMO_USERS.student;
    storage.saveCurrentUser(user);
    return user;
  },
};
