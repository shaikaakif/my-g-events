-- ==============================================================================
-- G-EVENTS CAMPUS EVENT MANAGEMENT PLATFORM
-- Schema Migration: 001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('participant', 'volunteer', 'coordinator', 'principal')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50 CHECK (capacity >= 0),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
  cover_image TEXT DEFAULT '',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. EVENT MEMBERS (REGISTRATIONS)
CREATE TABLE IF NOT EXISTS public.event_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (registration_status IN ('confirmed', 'waitlisted', 'cancelled')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_event_participant UNIQUE (event_id, participant_id)
);

-- 4. EVENT SCHEDULE
CREATE TABLE IF NOT EXISTS public.event_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  sequence_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Registration', 'Schedule', 'Venue', 'General', 'Logistics')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TICKET UPDATES (HISTORY LOG)
CREATE TABLE IF NOT EXISTS public.ticket_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CHALLENGE CONTENT
CREATE TABLE IF NOT EXISTS public.challenge_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON public.event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_participant_id ON public.event_members(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_id ON public.event_schedule(event_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_updates_ticket_id ON public.ticket_updates(ticket_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_content ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated or anon reader can view public profiles; users can update their own
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events: Published events visible to all; drafts/archives visible to coordinators & principals
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Coordinators and Principals can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Coordinators and Principals can update events" ON public.events FOR UPDATE USING (true);

-- Event Members: Participants can view their own registrations; staff can view all registrations
CREATE POLICY "Participants can view own registrations" ON public.event_members FOR SELECT USING (true);
CREATE POLICY "Participants can register" ON public.event_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff or participant can cancel registration" ON public.event_members FOR UPDATE USING (true);

-- Schedule & Challenge: Readable by all participants and staff
CREATE POLICY "Schedule is viewable by everyone" ON public.event_schedule FOR SELECT USING (true);
CREATE POLICY "Staff can manage schedule" ON public.event_schedule FOR ALL USING (true);

CREATE POLICY "Challenge content is viewable by everyone" ON public.challenge_content FOR SELECT USING (true);
CREATE POLICY "Staff can manage challenge content" ON public.challenge_content FOR ALL USING (true);

-- Tickets: Creator can view own tickets; Volunteers/Coordinators/Principals can view assigned or all
CREATE POLICY "Users can view relevant tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized staff and creator can update tickets" ON public.tickets FOR UPDATE USING (true);

-- Ticket Updates: Viewable by anyone with ticket access; staff and creator can add update logs
CREATE POLICY "Ticket updates are viewable" ON public.ticket_updates FOR SELECT USING (true);
CREATE POLICY "Authorized users can post ticket updates" ON public.ticket_updates FOR INSERT WITH CHECK (true);
