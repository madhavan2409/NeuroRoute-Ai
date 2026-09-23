export type UserRole = 'STUDENT' | 'ORGANIZER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  year?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}
