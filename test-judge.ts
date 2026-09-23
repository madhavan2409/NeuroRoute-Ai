// Comprehensive Hackathon Judge Stress Test
// Tests business logic, edge cases, error prevention, capacity calculations, and security constraints

// Polyfill browser globals for node test environment
if (typeof (globalThis as any).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { storage } from './src/services/storage';
import { eventService } from './src/services/eventService';
import { registrationService } from './src/services/registrationService';
import { authService } from './src/services/authService';
import { computeEventStatus } from './src/lib/utils';

console.log('========================================================');
console.log('🏛️  HACKATHON JUDGE PERSPECTIVE: SYSTEM BREAK & STRESS TEST');
console.log('========================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: Seed Data Verification
  console.log('--- TEST 1: Seed Data & Storage Initialization ---');
  const initialEvents = await eventService.getAllEvents();
  assert(initialEvents.length >= 8, `Loaded ${initialEvents.length} realistic campus events`);
  
  const techSymposium = initialEvents.find(e => e.id === 'evt_tech_symposium');
  assert(techSymposium !== undefined, 'Found Tech Symposium 2026');
  assert(techSymposium?.registeredCount === 142 && techSymposium?.capacity === 200, 'Initial capacity correct (142 / 200)');

  // Test 2: Dynamic Event Status & Capacity Logic
  console.log('\n--- TEST 2: Dynamic Event Status & Capacity Calculations ---');
  const openStatus = computeEventStatus(techSymposium!);
  assert(openStatus.effectiveStatus === 'Registration Open', 'Tech Symposium status is Registration Open');
  assert(openStatus.seatsRemaining === 58, 'Tech Symposium has 58 seats remaining');

  const fullEvent = initialEvents.find(e => e.id === 'evt_hackathon_2026')!;
  const fullStatus = computeEventStatus(fullEvent);
  assert(fullStatus.isRegisterable === false, 'Hackathon 2026 (100/100) is NOT registerable');
  assert(fullStatus.badgeLabel === 'Event Full', 'Shows "Event Full" badge');

  const almostFullEvent = initialEvents.find(e => e.id === 'evt_ai_workshop')!;
  const almostFullStatus = computeEventStatus(almostFullEvent);
  assert(almostFullStatus.effectiveStatus === 'Almost Full', 'AI Workshop is Almost Full (47/50)');
  assert(almostFullStatus.seatsRemaining === 3, 'Calculates exactly 3 seats remaining');

  // Test 3: Standard Student Registration Flow
  console.log('\n--- TEST 3: Student Registration Flow & Seat Reservation ---');
  const reg1 = await registrationService.registerForEvent(
    'evt_tech_symposium',
    'student_judge_01',
    {
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav.judge@campus.edu',
      studentRollNo: '2025CS999',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      phone: '9876543210',
    }
  );
  assert(reg1 && reg1.registrationId.startsWith('REG-'), `Created registration ID: ${reg1.registrationId}`);
  assert(reg1.status === 'Confirmed', 'Registration status is Confirmed');

  const updatedSymposium = await eventService.getEventById('evt_tech_symposium');
  assert(updatedSymposium?.registeredCount === 143, 'Event registered count incremented atomically to 143');

  // Test 4: DUPLICATE REGISTRATION ATTEMPT (Same student/roll/email)
  console.log('\n--- TEST 4: BREAK ATTEMPT - Duplicate Registration ---');
  try {
    await registrationService.registerForEvent(
      'evt_tech_symposium',
      'student_judge_01',
      {
        studentName: 'Aarav Sharma',
        studentEmail: 'aarav.judge@campus.edu',
        studentRollNo: '2025CS999',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        phone: '9876543210',
      }
    );
    assert(false, 'Should NOT allow duplicate registration for the same event');
  } catch (err: any) {
    assert(err.message.includes('Duplicate Registration'), `Blocked duplicate registration: ${err.message}`);
  }

  // Test 5: REGISTER FOR FULL EVENT ATTEMPT
  console.log('\n--- TEST 5: BREAK ATTEMPT - Register for Full Event ---');
  try {
    await registrationService.registerForEvent(
      'evt_hackathon_2026',
      'student_judge_02',
      {
        studentName: 'Late Student',
        studentEmail: 'late@campus.edu',
        studentRollNo: '2025CS888',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        phone: '9876543211',
      }
    );
    assert(false, 'Should NOT allow registering for full event');
  } catch (err: any) {
    assert(
      err.message.includes('maximum capacity') || err.message.includes('not available'),
      `Prevented overbooking: ${err.message}`
    );
  }

  // Test 6: INVALID FORM VALIDATION ATTEMPTS
  console.log('\n--- TEST 6: BREAK ATTEMPT - Invalid Form Fields ---');
  try {
    await registrationService.registerForEvent('evt_tech_symposium', 'student_judge_03', {
      studentName: '',
      studentEmail: 'not-an-email',
      studentRollNo: '',
      department: '',
      year: '',
      phone: '123',
    });
    assert(false, 'Should reject invalid form');
  } catch (err: any) {
    assert(err.message.length > 0, `Validated form: ${err.message}`);
  }

  // Test 7: REGISTRATION CANCELLATION & SEAT RESTORATION
  console.log('\n--- TEST 7: Student Cancellation & Capacity Restoration ---');
  const cancelledReg = await registrationService.cancelRegistration(reg1.id);
  assert(cancelledReg.status === 'Cancelled', 'Registration status successfully set to Cancelled');

  const symposiumAfterCancel = await eventService.getEventById('evt_tech_symposium');
  assert(symposiumAfterCancel?.registeredCount === 142, 'Seat count immediately restored from 143 back to 142');

  // Test 8: ORGANIZER EVENT CREATION, CAPACITY CAP & STATUS AUTOMATION
  console.log('\n--- TEST 8: Organizer Event Creation & Automatic Capacity Cap ---');
  const smallEvent = await eventService.createEvent({
    organizerId: 'usr_organizer_01',
    organizerName: 'Prof. Ananya Iyer',
    organizerEmail: 'organizer@demo.com',
    title: 'Judge Micro Workshop',
    category: 'Workshop',
    description: 'Testing live event creation with capacity = 2.',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '12:00',
    venue: 'Hall 404',
    capacity: 2, // Low capacity to test transition to full
    registrationOpen: '2026-09-01T00:00:00Z',
    registrationClose: '2026-11-19T23:59:59Z',
    status: 'Registration Open',
  });
  assert(smallEvent.id.startsWith('evt_'), `Organizer created event ID: ${smallEvent.id}`);

  // Register Student 1
  await registrationService.registerForEvent(smallEvent.id, 's_1', {
    studentName: 'Student One',
    studentEmail: 's1@demo.com',
    studentRollNo: 'CS01',
    department: 'CSE',
    year: '1st Year',
    phone: '9876543210',
  });
  let curEvent = await eventService.getEventById(smallEvent.id);
  assert(curEvent?.registeredCount === 1, '1 seat filled');

  // Register Student 2 (fills event)
  await registrationService.registerForEvent(smallEvent.id, 's_2', {
    studentName: 'Student Two',
    studentEmail: 's2@demo.com',
    studentRollNo: 'CS02',
    department: 'CSE',
    year: '1st Year',
    phone: '9876543211',
  });
  curEvent = await eventService.getEventById(smallEvent.id);
  assert(curEvent?.registeredCount === 2, '2 of 2 seats filled');
  const capStatus = computeEventStatus(curEvent!);
  assert(capStatus.isRegisterable === false, 'Event is no longer registerable');
  assert(capStatus.badgeLabel === 'Event Full', 'Status automatically transitioned to "Event Full"');

  // Attempting 3rd student must be rejected
  try {
    await registrationService.registerForEvent(smallEvent.id, 's_3', {
      studentName: 'Student Three',
      studentEmail: 's3@demo.com',
      studentRollNo: 'CS03',
      department: 'CSE',
      year: '1st Year',
      phone: '9876543212',
    });
    assert(false, 'Should reject 3rd student over capacity');
  } catch (err: any) {
    assert(err.message.includes('maximum capacity'), `Blocked 3rd student: ${err.message}`);
  }

  // Test 9: ORGANIZER ANALYTICS & RECHARTS DATA PREPARATION
  console.log('\n--- TEST 9: Organizer Analytics Calculation ---');
  const stats = await eventService.getOrganizerStats();
  assert(stats.totalEvents > 0, `Total events: ${stats.totalEvents}`);
  assert(stats.activeEvents >= 0, `Active events: ${stats.activeEvents}`);
  assert(stats.totalRegistrations > 0, `Total registrations: ${stats.totalRegistrations}`);
  assert(stats.registrationsPerEvent.length > 0, 'Recharts bar dataset generated');
  assert(stats.categoryData.length > 0, 'Recharts category pie dataset generated');
  assert(stats.trendData.length > 0, 'Recharts daily trend dataset generated');

  // Test 10: SEARCH & EMPTY RESULT HANDLING
  console.log('\n--- TEST 10: Search & Empty State Handling ---');
  const searchEmpty = await eventService.getAllEvents({ searchQuery: 'non_existent_keyword_9999' });
  assert(Array.isArray(searchEmpty) && searchEmpty.length === 0, 'Empty search returns empty array cleanly');

  // Test 11: AUTH ROLE SWITCHING & DEMO ACCOUNTS
  console.log('\n--- TEST 11: Demo Authentication & Role Switching ---');
  const studentUser = await authService.login('student@demo.com');
  assert(studentUser.role === 'STUDENT', 'Logged in as STUDENT');
  assert(studentUser.name === 'Aarav Sharma', 'Student profile name correct');

  const organizerUser = await authService.login('organizer@demo.com');
  assert(organizerUser.role === 'ORGANIZER', 'Logged in as ORGANIZER');
  assert(organizerUser.name === 'Prof. Ananya Iyer', 'Organizer profile name correct');

  // Final Summary
  console.log('\n========================================================');
  console.log(`JUDGE TEST COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('========================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal crash in tests:', err);
  process.exit(1);
});
