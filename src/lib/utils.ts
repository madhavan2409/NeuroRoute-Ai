import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CampusEvent, EventStatus } from '../types/event';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}

export interface ComputedEventStatus {
  effectiveStatus: EventStatus;
  badgeLabel: string;
  badgeVariant: 'emerald' | 'amber' | 'rose' | 'slate' | 'blue' | 'purple';
  isRegisterable: boolean;
  reason?: string;
  seatsRemaining: number;
  percentageFilled: number;
}

export function computeEventStatus(event: CampusEvent): ComputedEventStatus {
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);
  const percentageFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  // 1. Manual cancellations or draft take precedence
  if (event.status === 'Cancelled') {
    return {
      effectiveStatus: 'Cancelled',
      badgeLabel: 'Cancelled',
      badgeVariant: 'rose',
      isRegisterable: false,
      reason: 'This event has been cancelled by the organizer.',
      seatsRemaining,
      percentageFilled,
    };
  }

  if (event.status === 'Draft') {
    return {
      effectiveStatus: 'Draft',
      badgeLabel: 'Draft',
      badgeVariant: 'slate',
      isRegisterable: false,
      reason: 'This event is currently in draft mode and not published.',
      seatsRemaining,
      percentageFilled,
    };
  }

  if (event.status === 'Completed') {
    return {
      effectiveStatus: 'Completed',
      badgeLabel: 'Completed',
      badgeVariant: 'blue',
      isRegisterable: false,
      reason: 'This event has concluded.',
      seatsRemaining,
      percentageFilled,
    };
  }

  const now = new Date();
  const eventDateObj = new Date(`${event.date}T${event.endTime || '23:59'}:00`);

  // Check if event date is in the past
  if (!isNaN(eventDateObj.getTime()) && now > eventDateObj) {
    return {
      effectiveStatus: 'Completed',
      badgeLabel: 'Completed',
      badgeVariant: 'blue',
      isRegisterable: false,
      reason: 'This event has already taken place.',
      seatsRemaining,
      percentageFilled,
    };
  }

  // Check registration open date
  if (event.registrationOpen) {
    const openDate = new Date(event.registrationOpen);
    if (!isNaN(openDate.getTime()) && now < openDate) {
      return {
        effectiveStatus: 'Draft',
        badgeLabel: 'Coming Soon',
        badgeVariant: 'purple',
        isRegisterable: false,
        reason: `Registration opens on ${openDate.toLocaleDateString()} at ${openDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        seatsRemaining,
        percentageFilled,
      };
    }
  }

  // Check registration close date
  if (event.registrationClose) {
    const closeDate = new Date(event.registrationClose);
    if (!isNaN(closeDate.getTime()) && now > closeDate) {
      return {
        effectiveStatus: 'Registration Closed',
        badgeLabel: 'Registration Closed',
        badgeVariant: 'rose',
        isRegisterable: false,
        reason: `Registration deadline passed on ${closeDate.toLocaleDateString()}.`,
        seatsRemaining,
        percentageFilled,
      };
    }
  }

  // Check capacity
  if (seatsRemaining <= 0) {
    return {
      effectiveStatus: 'Registration Closed',
      badgeLabel: 'Event Full',
      badgeVariant: 'rose',
      isRegisterable: false,
      reason: 'This event has reached its maximum capacity.',
      seatsRemaining: 0,
      percentageFilled: 100,
    };
  }

  // Almost full threshold (<= 10% of capacity or <= 5 seats remaining)
  const isNearCapacity = seatsRemaining <= Math.max(5, Math.floor(event.capacity * 0.15));
  if (isNearCapacity) {
    return {
      effectiveStatus: 'Almost Full',
      badgeLabel: `Almost Full (${seatsRemaining} left)`,
      badgeVariant: 'amber',
      isRegisterable: true,
      reason: `Hurry! Only ${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} remaining.`,
      seatsRemaining,
      percentageFilled,
    };
  }

  // Otherwise, Registration is Open
  return {
    effectiveStatus: 'Registration Open',
    badgeLabel: 'Registration Open',
    badgeVariant: 'emerald',
    isRegisterable: true,
    seatsRemaining,
    percentageFilled,
  };
}

export function generateRegistrationId(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REG-${currentYear}-${randomSuffix}`;
}

export function downloadCSV(filename: string, rows: Record<string, string | number | undefined>[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
