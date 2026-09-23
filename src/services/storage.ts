import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, DEMO_USERS } from '../data/mockData';
import { CampusEvent } from '../types/event';
import { EventRegistration } from '../types/registration';
import { UserProfile } from '../types/user';

const STORAGE_KEYS = {
  EVENTS: 'eventhub_events_v1',
  REGISTRATIONS: 'eventhub_registrations_v1',
  CURRENT_USER: 'eventhub_current_user_v1',
  USERS: 'eventhub_users_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(Object.values(DEMO_USERS)));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to student demo user for initial landing experience
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.student));
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Storage listener error:', e);
      }
    });
  }

  public getEvents(): CampusEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  }

  public saveEvents(events: CampusEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify();
  }

  public getRegistrations(): EventRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return data ? JSON.parse(data) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  }

  public saveRegistrations(registrations: EventRegistration[]): void {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    this.notify();
  }

  public getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public saveCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  public resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.student));
    this.notify();
  }
}

export const storage = new StorageService();
