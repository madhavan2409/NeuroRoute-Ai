export type RegistrationStatus =
  | 'Registered'
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled';

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string; // user id
  registrationId: string; // e.g. "REG-2026-8742"
  registeredAt: string; // ISO date-time string
  status: RegistrationStatus;
  
  // Student registration details
  studentName: string;
  studentEmail: string;
  studentRollNo: string; // Institutional ID e.g. "2024CS108"
  department: string;
  year: string; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  phone: string;

  // Cached event snapshot for offline/quick student view
  eventTitle?: string;
  eventDate?: string;
  eventVenue?: string;
  eventBanner?: string;
  eventStartTime?: string;
  eventCategory?: string;
}

export interface RegistrationFormData {
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  department: string;
  year: string;
  phone: string;
}
