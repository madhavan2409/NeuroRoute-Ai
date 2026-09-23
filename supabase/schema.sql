-- ==============================================================================
-- PS06: Event Registration System - Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Create Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'ORGANIZER')),
  student_id TEXT,
  department TEXT,
  year TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Events table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Technology', 'Workshop', 'Hackathon', 'Cultural', 'Sports', 'Career', 'Academic', 'Seminar')),
  description TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count >= 0),
  registration_open TIMESTAMPTZ NOT NULL,
  registration_close TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Registration Open' CHECK (status IN ('Draft', 'Registration Open', 'Almost Full', 'Registration Closed', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_capacity CHECK (registered_count <= capacity)
);

-- 3. Create Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registration_id TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Registered', 'Pending', 'Confirmed', 'Cancelled')),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_id_number TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  phone TEXT NOT NULL,
  -- Prevent duplicate active registrations per student per event:
  CONSTRAINT unique_active_student_event UNIQUE (event_id, student_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events
CREATE POLICY "Published events are viewable by everyone" 
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Organizers can create events" 
  ON public.events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ORGANIZER')
  );

CREATE POLICY "Organizers can update their own events" 
  ON public.events FOR UPDATE USING (
    organizer_id = auth.uid()
  );

CREATE POLICY "Organizers can delete their own events" 
  ON public.events FOR DELETE USING (
    organizer_id = auth.uid()
  );

-- Registrations
CREATE POLICY "Students can view their own registrations" 
  ON public.registrations FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.events WHERE events.id = registrations.event_id AND events.organizer_id = auth.uid())
  );

CREATE POLICY "Students can create registrations" 
  ON public.registrations FOR INSERT WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Students can cancel their own registration" 
  ON public.registrations FOR UPDATE USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.events WHERE events.id = registrations.event_id AND events.organizer_id = auth.uid())
  );

-- 6. Atomic Capacity Trigger (Maintains registered_count and status)
CREATE OR REPLACE FUNCTION public.handle_registration_count_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.events
    SET 
      registered_count = registered_count + 1,
      status = CASE 
        WHEN registered_count + 1 >= capacity THEN 'Registration Closed'
        WHEN capacity - (registered_count + 1) <= 5 THEN 'Almost Full'
        ELSE status 
      END
    WHERE id = NEW.event_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != 'Cancelled' AND NEW.status = 'Cancelled') THEN
      UPDATE public.events
      SET 
        registered_count = GREATEST(0, registered_count - 1),
        status = CASE 
          WHEN status = 'Registration Closed' AND registered_count - 1 < capacity THEN 'Registration Open'
          ELSE status 
        END
      WHERE id = NEW.event_id;
    ELSIF (OLD.status = 'Cancelled' AND NEW.status != 'Cancelled') THEN
      UPDATE public.events
      SET 
        registered_count = registered_count + 1,
        status = CASE 
          WHEN registered_count + 1 >= capacity THEN 'Registration Closed'
          WHEN capacity - (registered_count + 1) <= 5 THEN 'Almost Full'
          ELSE status 
        END
      WHERE id = NEW.event_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status != 'Cancelled') THEN
      UPDATE public.events
      SET registered_count = GREATEST(0, registered_count - 1)
      WHERE id = OLD.event_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_registration_change
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_registration_count_update();
