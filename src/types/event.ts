export type EventStatus =
  | 'Draft'
  | 'Registration Open'
  | 'Almost Full'
  | 'Registration Closed'
  | 'Completed'
  | 'Cancelled';

export type EventCategory =
  | 'Technology'
  | 'Workshop'
  | 'Hackathon'
  | 'Cultural'
  | 'Sports'
  | 'Career'
  | 'Academic'
  | 'Seminar';

export interface CampusEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  title: string;
  category: EventCategory;
  description: string;
  bannerUrl: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  capacity: number;
  registeredCount: number;
  registrationOpen: string; // ISO date-time string
  registrationClose: string; // ISO date-time string
  status: EventStatus;
  createdAt: string;
  tags?: string[];
  requirements?: string[];
}

export interface EventFilterOptions {
  searchQuery?: string;
  category?: EventCategory | 'ALL';
  dateFilter?: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'UPCOMING';
  availability?: 'ALL' | 'OPEN_ONLY' | 'HAS_SEATS';
  sortBy?: 'DATE_ASC' | 'DATE_DESC' | 'POPULARITY' | 'SEATS_LEFT' | 'TITLE_ASC';
}
