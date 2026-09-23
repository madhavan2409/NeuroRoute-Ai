// Comprehensive Hackathon Judge Stress Test
// Tests the business logic, edge cases, error prevention, and capacity calculations

import { storage } from './src/services/storage.js';
import { eventService } from './src/services/eventService.js';
import { registrationService } from './src/services/registrationService.js';
import { authService } from './src/services/authService.js';
import { computeEventStatus } from './src/lib/utils.js';

console.log('=== STARTING JUDGE STRESS TEST ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
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
  console.log('\n--- 1. Verification of Seed Data ---');
  const initialEvents = await eventService.getAllEvents();
  assert(initialEvents.length >= 8, `Loaded ${initialEvents.length} realistic campus events`);
  
  const techSymposium = initialEvents.find(e => e.id === 'evt_tech_symposium');
  assert(techSymposium !== undefined, 'Found Tech Symposium 2026');
  assert(techSymposium.registeredCount === 142 && techSymposium.capacity === 200, 'Initial capacity correct');

  // Test 2: Status Computation Logic
  console.log('\n--- 2. Dynamic Event Status & Capacity Logic ---');
  const openStatus = computeEventStatus(techSymposium);
  assert(openStatus.effectiveStatus === 'Registration Open', 'Tech Symposium is Open');
  assert(openStatus.seatsRemaining === 58, 'Tech Symposium has 58 seats remaining');

  const fullEvent = initialEvents.find(e => e.id === 'evt_hackathon_2026');
  const fullStatus = computeEventStatus(fullEvent);
  assert(fullStatus.isRegisterable === false, 'Hackathon 2026 at capacity is NOT registerable');
  assert(fullStatus.badgeLabel === 'Event Full', 'Shows "Event Full" label');

  const almostFullEvent = initialEvents.find(e => e.id === 'evt_ai_workshop');
  const almostFullStatus = computeEventStatus(almostFullEvent);
  assert(almostFullStatus.effectiveStatus === 'Almost Full', 'AI Workshop is Almost Full (47/50)');
  assert(almostFullStatus.seatsRemaining === 3, 'Only 3 seats remaining in AI workshop');

  // Test 3: Normal Student Registration
  console.log('\n--- 3. Student Registration Flow ---');
  const reg1 = await registrationService.registerForEvent(
    'evt_tech_symposium',
    'student_judge_01',
    {
      studentName: 'Judge Tester',
      studentEmail: 'judge.test@campus.edu',
      studentRollNo: '2025CS999',
      department: 'Computer Science',
      year: '4th Year',
      phone: '9998887770',
    }
  );
  assert(reg1 && reg1.registrationId.startsWith('REG-'), `Created registration ID: ${reg1.registrationId}`);
  assert(reg1.status === 'Confirmed', 'Registration status is Confirmed');

  const updatedSymposium = await eventService.getEventById('evt_tech_symposium');
  assert(updatedSymposium.registeredCount === 143, 'Event registered count incremented to 143');

  // Test 4: DUPLICATE REGISTRATION PREVENTION
  console.log('\n--- 4. BREAK TEST: Duplicate Registration ---');
  try {
    await registrationService.registerForEvent(
      'evt_tech_symposium',
      'student_judge_01',
      {
        studentName: 'Judge Tester',
        studentEmail: 'judge.test@campus.edu',
        studentRollNo: '2025CS999',
        department: 'Computer Science',
        year: '4th Year',
        phone: '9998887770',
      }
    );
    assert(false, 'Should NOT allow duplicate registration');
  } catch (err) {
    assert(err.message.includes('Duplicate Registration'), `Blocked duplicate registration: ${err.message}`);
  }

  // Test 5: FULL EVENT REGISTRATION ATTEMPT
  console.log('\n--- 5. BREAK TEST: Registering for Full Event ---');
  try {
    await registrationService.registerForEvent(
      'evt_hackathon_2026',
      'student_judge_02',
      {
        studentName: 'Full Event Attempter',
        studentEmail: 'full@campus.edu',
        studentRollNo: '2025CS888',
        department: 'Computer Science',
        year: '2nd Year',
        phone: '9998887771',
      }
    );
    assert(false, 'Should NOT allow registering for full event');
  } catch (err) {
    assert(
      err.message.includes('capacity') || err.message.includes('not available'),
      `Blocked registration for full event: ${err.message}`
    );
  }

  // Test 6: INVALID FORM VALIDATION
  console.log('\n--- 6. BREAK TEST: Invalid Form Submissions ---');
  try {
    await registrationService.registerForEvent('evt_tech_symposium', 'student_judge_03', {
      studentName: '',
      studentEmail: 'invalidemail',
      studentRollNo: '',
      department: '',
      year: '',
      phone: '123',
    });
    assert(false, 'Should reject empty/invalid form');
  } catch (err) {
    assert(err.message.length > 0, `Properly rejected invalid form: ${err.message}`);
  }

  // Test 7: STUDENT CANCELLATION & SEAT RESTORATION
  console.log('\n--- 7. Registration Cancellation & Seat Restoration ---');
  const cancelledReg = await registrationService.cancelRegistration(reg1.id);
  assert(cancelledReg.status === 'Cancelled', 'Registration status updated to Cancelled');

  const symposiumAfterCancel = await eventService.getEventById('evt_tech_symposium');
  assert(symposiumAfterCancel.registeredCount === 142, 'Seat count restored back to 142');

  // Test 8: ORGANIZER EVENT CREATION & CRUD
  console.log('\n--- 8. Organizer Event Creation & Management ---');
  const newEvt = await eventService.createEvent({
    organizerId: 'usr_organizer_01',
    organizerName: 'Prof. Ananya Iyer',
    organizerEmail: 'organizer@demo.com',
    title: 'Judge Evaluation Workshop',
    category: 'Technology',
    description: 'Testing live event creation in judge mode.',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    date: '2026-11-20',
    startTime: '10:00',
    endTime: '12:00',
    venue: 'Audit Room 1',
    capacity: 2, // Very low capacity for testing fill
    registrationOpen: '2026-09-01T00:00:00Z',
    registrationClose: '2026-11-19T23:59:59Z',
    status: 'Registration Open',
  });
  assert(newEvt.id.startsWith('evt_'), `Created event with ID: ${newEvt.id}`);

  // Register 2 students to fill it up completely
  await registrationService.registerForEvent(newEvt.id, 's_1', {
    studentName: 'Student One',
    studentEmail: 's1@demo.com',
    studentRollNo: 'CS01',
    department: 'CSE',
    year: '1st Year',
    phone: '9876543210',
  });
  await registrationService.registerForEvent(newEvt.id, 's_2', {
    studentName: 'Student Two',
    studentEmail: 's2@demo.com',
    studentRollNo: 'CS02',
    department: 'CSE',
    year: '1st Year',
    phone: '9876543211',
  });

  const filledEvt = await eventService.getEventById(newEvt.id);
  assert(filledEvt.registeredCount === 2, 'Registered count is 2');
  const filledStatus = computeEventStatus(filledEvt);
  assert(filledStatus.seatsRemaining === 0, '0 seats remaining');
  assert(filledStatus.isRegisterable === false, 'Automatically closed because capacity reached');

  // Test 9: SEARCH & EMPTY LIST HANDLING
  console.log('\n--- 9. Search & Empty State Handling ---');
  const searchResults = await eventService.getAllEvents({ searchQuery: 'xyznonexistent123' });
  assert(Array.isArray(searchResults) && searchResults.length === 0, 'Handled non-existent search gracefully');

  // Test 10: ORGANIZER METRICS & CHARTS COMPUTATION
  console.log('\n--- 10. Organizer Stats & Chart Data ---');
  const stats = await eventService.getOrganizerStats();
  assert(stats.totalEvents > 0, `Total events: ${stats.totalEvents}`);
  assert(stats.registrationsPerEvent.length > 0, 'Recharts bar chart dataset calculated');
  assert(stats.categoryData.length > 0, 'Recharts category pie dataset calculated');
  assert(stats.trendData.length > 0, 'Recharts trend area dataset calculated');

  // Summary
  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
