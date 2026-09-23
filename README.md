# EventHub – Campus Event Registration System (PS06)

> A production-quality, responsive campus event discovery and registration platform built for **PS06 – Event Registration System**. Featuring live seat capacity management, role-based workflows for students and organizers, Recharts analytics, digital QR boarding passes, and participant CSV exports.

---

## ⚡ Live Hackathon Demo Fast Track

The application is built with a **Zero-Setup Dual-Mode Data Architecture**. It runs out-of-the-box locally with mock data and persistent `localStorage`, with seamless transition to **Supabase PostgreSQL** when credentials are provided in `.env`.

### Instant Demo Credentials:
- **Student Account**: `student@demo.com` (Name: Aarav Sharma • Roll No: 2024CS108 • 3rd Year CSE)
- **Organizer Account**: `organizer@demo.com` (Name: Prof. Ananya Iyer • Head of Innovation)
- *Password in Demo Mode*: Any password (or click the **1-Click Quick Switcher** buttons in the header / login modal).

---

## 🚀 Key Features Implemented

### 1. Student Event Discovery & Details (`/events`, `/events/:id`)
- **Live Search & Multi-Filters**: Instant search by event title, keywords, venue, or organizer name. Filter by category, date range (*Today, This Week, This Month, Upcoming*), and availability (*Open Only, Available Seats Only*).
- **Sorting Options**: Sort by date soonest/latest, most popular, seats remaining, or title (A–Z).
- **Detailed Event Page**: Hero banner, full event description, prerequisite checklist, organizer contact card, and real-time seat availability progress bar.
- **Dynamic CTA Logic**:
  - *Registration Open* → "Register Now" with live countdown & remaining seats.
  - *Almost Full* (≤ 5 seats or ≤ 15% capacity) → "Almost Full" amber urgency badge.
  - *Capacity Reached* → Registration disabled with friendly explanation: *"This event has reached its maximum capacity."*
  - *After Deadline* → Disabled with explanation: *"Registration deadline passed on [Date]."*
  - *Already Registered* → Green *"Registered"* badge with direct link to digital boarding pass.

### 2. Student Registration & Validation (`RegistrationModal`, `TicketModal`)
- **Verified Registration Fields**: Full Name, University Email, Student ID / Roll Number, Academic Department, Year of Study, and Contact Phone.
- **Strict Validation Rules**:
  - Prevents registrations when event is full or deadline has passed.
  - **Duplicate Prevention**: Strictly blocks multiple active registrations for the same student on the same event.
  - **Atomic Capacity Decrement**: Updates event seat counter immediately upon submission.
- **Digital Boarding Pass & QR Pass**: Generates a unique ticket identifier (e.g. `REG-2026-XXXX`), celebratory confetti animation, print/download pass option, and ticket details.

### 3. Student Dashboard (`/student/dashboard`)
- **KPI Metrics**: Total Registered Events, Upcoming Events, Completed Events, and Cancelled Registrations.
- **Filter Tabs**: All, Upcoming, Completed, and Cancelled event registrations.
- **Pass Details**: View ticket pass or cancel registration with confirmation dialog.
- **Seat Restoration**: Cancelling a registration immediately releases the reserved seat back to the event pool.

### 4. Organizer Analytics & Dashboard (`/organizer/dashboard`)
- **Top Metric Cards**: Total Events, Active Events, Total Registrations, Upcoming Events, Completed Events.
- **Interactive Visualizations (Recharts)**:
  - **Bar Chart**: Registrations vs. Capacity per Event.
  - **Donut/Pie Chart**: Registrations by Event Domain/Category.
  - **Area/Line Chart**: Daily Registration Trajectory timeline.
- **Quick Event Manager Feed**: Live table preview of active events with direct links to participant rosters.

### 5. Organizer Event Management (`/organizer/events`)
- **Complete Event CRUD**: Create new campus events, edit existing event details, or delete events with confirmation.
- **Status Lifecycle Controls**: One-click toggles between `Draft`, `Registration Open`, `Almost Full`, `Registration Closed`, `Completed`, and `Cancelled`.
- **Form Modal**: Full configuration of title, category, date, time slots, venue, preset banner selector, capacity, and registration window.

### 6. Participant Management & CSV Export (`/organizer/events/:id/participants`)
- **Search & Filter Participants**: Search by attendee name, student roll number, email, or registration ID. Filter by status (*Confirmed, Registered, Pending, Cancelled*) and department.
- **Inline Status Management**: Change participant status or cancel individual seats with immediate seat recovery.
- **One-Click CSV Export**: Downloads clean, formatted spreadsheet data with headers and attendee details ready for venue security and certificates.

### 7. Security & Route Protection (`ProtectedRoute.tsx`)
- Role-based route guard strictly separates `STUDENT` and `ORGANIZER` views.
- Unauthorized access attempts display a descriptive warning toast and redirect the user to their appropriate dashboard.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Navigation**: React Router v6
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Micro-Interactions**: Canvas-Confetti, Tailwind Animations
- **Backend / Database**: Supabase Client SDK (`@supabase/supabase-js`) + LocalStorage Reactive Engine
- **Database Engine**: PostgreSQL with Row Level Security (RLS) and triggers

---

## 🗄️ Database Structure (`supabase/schema.sql`)

### 1. `profiles`
- `id` (UUID, Primary Key, references `auth.users`)
- `email` (TEXT, Unique)
- `name` (TEXT)
- `role` (TEXT, `'STUDENT'` | `'ORGANIZER'`)
- `student_id` (TEXT)
- `department` (TEXT)
- `year` (TEXT)
- `phone` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 2. `events`
- `id` (TEXT, Primary Key)
- `organizer_id` (UUID, references `profiles.id`)
- `organizer_name` (TEXT)
- `organizer_email` (TEXT)
- `title` (TEXT)
- `category` (TEXT, CHECK category IN ('Technology', 'Workshop', 'Hackathon', 'Cultural', 'Sports', 'Career', 'Academic', 'Seminar'))
- `description` (TEXT)
- `banner_url` (TEXT)
- `date` (DATE)
- `start_time` (TIME), `end_time` (TIME)
- `venue` (TEXT)
- `capacity` (INTEGER, > 0)
- `registered_count` (INTEGER, DEFAULT 0, <= capacity)
- `registration_open` (TIMESTAMPTZ), `registration_close` (TIMESTAMPTZ)
- `status` (TEXT, CHECK IN ('Draft', 'Registration Open', 'Almost Full', 'Registration Closed', 'Completed', 'Cancelled'))
- `created_at` (TIMESTAMPTZ)

### 3. `registrations`
- `id` (TEXT, Primary Key)
- `event_id` (TEXT, references `events.id`)
- `student_id` (UUID, references `profiles.id`)
- `registration_id` (TEXT, Unique, e.g. `REG-2026-XXXX`)
- `registered_at` (TIMESTAMPTZ)
- `status` (TEXT, CHECK IN ('Registered', 'Pending', 'Confirmed', 'Cancelled'))
- `student_name`, `student_email`, `student_id_number`, `department`, `year`, `phone`
- **Unique Constraint**: `CONSTRAINT unique_active_student_event UNIQUE (event_id, student_id)` prevents duplicate registrations at the database level.
- **Trigger `on_registration_change`**: Atomically updates `registered_count` on insert, update, or cancellation.

---

## 💻 How to Run the Project Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Run Automated Judge Stress Test
```bash
npx tsx test-judge.ts
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Environment Variables (`.env`)

To connect to a live Supabase instance (optional):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(If left empty or unconfigured, the application runs in zero-setup local demo mode with 100% full functionality).*
