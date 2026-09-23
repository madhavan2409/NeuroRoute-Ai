import { storage } from './storage';
import { EventRegistration, RegistrationFormData, RegistrationStatus } from '../types/registration';
import { computeEventStatus, generateRegistrationId } from '../lib/utils';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const registrationService = {
  async registerForEvent(
    eventId: string,
    studentId: string,
    formData: RegistrationFormData
  ): Promise<EventRegistration> {
    // 1. Fetch current events
    const events = storage.getEvents();
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }
    const event = events[eventIndex];

    // 2. Validate Event Status & Capacity
    const status = computeEventStatus(event);
    if (!status.isRegisterable) {
      throw new Error(status.reason || 'Registration is currently not available for this event.');
    }

    if (event.registeredCount >= event.capacity) {
      throw new Error('This event has reached its maximum capacity.');
    }

    // 3. Form Validation
    if (!formData.studentName?.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!formData.studentEmail?.trim() || !formData.studentEmail.includes('@')) {
      throw new Error('Please enter a valid university email address.');
    }
    if (!formData.studentRollNo?.trim()) {
      throw new Error('Please provide your Student ID / Roll Number.');
    }
    if (!formData.department?.trim()) {
      throw new Error('Please select or specify your department.');
    }
    if (!formData.year?.trim()) {
      throw new Error('Please specify your academic year.');
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('Please provide a valid 10-digit contact phone number.');
    }

    // 4. Duplicate Check
    const allRegistrations = storage.getRegistrations();
    const existingRegistration = allRegistrations.find(
      (r) =>
        r.eventId === eventId &&
        (r.studentId === studentId || r.studentEmail.toLowerCase() === formData.studentEmail.toLowerCase()) &&
        r.status !== 'Cancelled'
    );

    if (existingRegistration) {
      throw new Error(
        `Duplicate Registration: You are already registered for this event (Registration ID: ${existingRegistration.registrationId}).`
      );
    }

    // 5. Create Registration Record
    const regId = generateRegistrationId();
    const newRegistration: EventRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      eventId,
      studentId,
      registrationId: regId,
      registeredAt: new Date().toISOString(),
      status: 'Confirmed',
      studentName: formData.studentName.trim(),
      studentEmail: formData.studentEmail.trim(),
      studentRollNo: formData.studentRollNo.trim().toUpperCase(),
      department: formData.department.trim(),
      year: formData.year.trim(),
      phone: formData.phone.trim(),
      // Snapshot
      eventTitle: event.title,
      eventDate: event.date,
      eventVenue: event.venue,
      eventBanner: event.bannerUrl,
      eventStartTime: event.startTime,
      eventCategory: event.category,
    };

    // 6. Atomically update event seat count
    event.registeredCount += 1;
    // Check if event has now reached full or almost full
    if (event.registeredCount >= event.capacity) {
      event.status = 'Registration Closed';
    } else if (event.capacity - event.registeredCount <= 5) {
      event.status = 'Almost Full';
    }
    events[eventIndex] = event;

    // 7. Persist changes
    allRegistrations.unshift(newRegistration);
    storage.saveRegistrations(allRegistrations);
    storage.saveEvents(events);

    // Sync to Supabase in background if configured
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('registrations')
        .insert([
          {
            id: newRegistration.id,
            event_id: newRegistration.eventId,
            student_id: newRegistration.studentId,
            registration_id: newRegistration.registrationId,
            registered_at: newRegistration.registeredAt,
            status: newRegistration.status,
            student_name: newRegistration.studentName,
            student_email: newRegistration.studentEmail,
            student_id_number: newRegistration.studentRollNo,
            department: newRegistration.department,
            year: newRegistration.year,
            phone: newRegistration.phone,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('Supabase registration sync notice:', error.message);
        });
    }

    return newRegistration;
  },

  async getStudentRegistrations(studentId: string): Promise<EventRegistration[]> {
    const all = storage.getRegistrations();
    return all.filter((r) => r.studentId === studentId);
  },

  async getEventParticipants(eventId: string): Promise<EventRegistration[]> {
    const all = storage.getRegistrations();
    return all.filter((r) => r.eventId === eventId);
  },

  async cancelRegistration(registrationId: string, reason?: string): Promise<EventRegistration> {
    const allRegistrations = storage.getRegistrations();
    const regIndex = allRegistrations.findIndex((r) => r.id === registrationId || r.registrationId === registrationId);

    if (regIndex === -1) {
      throw new Error('Registration record not found.');
    }

    const reg = allRegistrations[regIndex];
    if (reg.status === 'Cancelled') {
      return reg;
    }

    reg.status = 'Cancelled';
    allRegistrations[regIndex] = reg;

    // Free up capacity in the event
    const events = storage.getEvents();
    const eventIndex = events.findIndex((e) => e.id === reg.eventId);
    if (eventIndex !== -1) {
      const event = events[eventIndex];
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      // Restore status if it was closed due to capacity
      if (event.status === 'Registration Closed' && event.registeredCount < event.capacity) {
        event.status = event.capacity - event.registeredCount <= 5 ? 'Almost Full' : 'Registration Open';
      }
      events[eventIndex] = event;
      storage.saveEvents(events);
    }

    storage.saveRegistrations(allRegistrations);
    return reg;
  },

  async updateRegistrationStatus(
    registrationId: string,
    newStatus: RegistrationStatus
  ): Promise<EventRegistration> {
    const allRegistrations = storage.getRegistrations();
    const regIndex = allRegistrations.findIndex((r) => r.id === registrationId || r.registrationId === registrationId);

    if (regIndex === -1) {
      throw new Error('Registration not found.');
    }

    const currentReg = allRegistrations[regIndex];
    const previousStatus = currentReg.status;

    if (previousStatus === newStatus) return currentReg;

    // Adjust seat counts if cancelling or un-cancelling
    const events = storage.getEvents();
    const eventIndex = events.findIndex((e) => e.id === currentReg.eventId);

    if (eventIndex !== -1) {
      const event = events[eventIndex];
      if (previousStatus !== 'Cancelled' && newStatus === 'Cancelled') {
        // Freed up seat
        event.registeredCount = Math.max(0, event.registeredCount - 1);
        if (event.status === 'Registration Closed' && event.registeredCount < event.capacity) {
          event.status = 'Registration Open';
        }
      } else if (previousStatus === 'Cancelled' && newStatus !== 'Cancelled') {
        // Seat re-claimed
        if (event.registeredCount >= event.capacity) {
          throw new Error('Cannot restore registration: the event is at full capacity.');
        }
        event.registeredCount += 1;
      }
      events[eventIndex] = event;
      storage.saveEvents(events);
    }

    currentReg.status = newStatus;
    allRegistrations[regIndex] = currentReg;
    storage.saveRegistrations(allRegistrations);

    return currentReg;
  },
};
