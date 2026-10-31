-- ==============================================================================
-- G-EVENTS CAMPUS EVENT MANAGEMENT PLATFORM
-- Seed Data: seed.sql
-- ==============================================================================

-- 1. SEED PROFILES
INSERT INTO public.profiles (id, full_name, email, role, avatar_url) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Aarav Patel', 'aarav.student@campus.edu', 'participant', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('a2222222-2222-2222-2222-222222222222', 'Maya Lin', 'maya.volunteer@campus.edu', 'volunteer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
  ('a3333333-3333-3333-3333-333333333333', 'Prof. David Vance', 'd.vance@campus.edu', 'coordinator', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
  ('a4444444-4444-4444-4444-444444444444', 'Dr. Eleanor Sterling', 'principal@campus.edu', 'principal', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED EVENTS
INSERT INTO public.events (id, title, description, category, venue, start_date, end_date, registration_deadline, capacity, status, cover_image, created_by) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'GreenPulse AI Hackathon 2026',
    'A 36-hour intensive campus hackathon dedicated to building climate-resilient intelligent technologies, carbon monitoring dashboards, and renewable energy trackers.',
    'Hackathon',
    'Campus Innovation Hub - Hall A',
    '2026-11-12T09:00:00Z',
    '2026-11-13T21:00:00Z',
    '2026-11-10T23:59:00Z',
    120,
    'published',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    'a3333333-3333-3333-3333-333333333333'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'Annual Quantum Computing Symposium',
    'Featuring guest keynote speakers from national research laboratories, live hardware demonstrations, and student research paper presentations.',
    'Symposium',
    'Main Auditorium & Science Concourse',
    '2026-11-18T10:00:00Z',
    '2026-11-18T17:00:00Z',
    '2026-11-15T23:59:00Z',
    250,
    'published',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    'a4444444-4444-4444-4444-444444444444'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'Aura Beats: Campus Cultural Fest',
    'The university flagship annual evening of music performances, acoustic showcases, indie band competitions, and artisanal student food pavilions.',
    'Cultural',
    'Open Air Amphitheatre',
    '2026-11-25T16:00:00Z',
    '2026-11-25T23:00:00Z',
    '2026-11-23T18:00:00Z',
    500,
    'published',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    'a3333333-3333-3333-3333-333333333333'
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    'Modern Distributed Systems Hands-on Workshop',
    'Deep dive into consensus algorithms, gRPC streams, high-availability architecture, and hands-on cluster deployments in an interactive lab format.',
    'Workshop',
    'Computer Science Lab 304',
    '2026-12-02T13:00:00Z',
    '2026-12-02T18:00:00Z',
    '2026-11-29T23:59:00Z',
    40,
    'published',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'a3333333-3333-3333-3333-333333333333'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED REGISTRATIONS (EVENT MEMBERS)
INSERT INTO public.event_members (id, event_id, participant_id, registration_status, registered_at) VALUES
  ('m1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'confirmed', '2026-10-28T14:30:00Z'),
  ('m2222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'confirmed', '2026-10-29T09:15:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED EVENT SCHEDULE
INSERT INTO public.event_schedule (id, event_id, title, description, start_time, end_time, venue, sequence_number) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Participant Check-in & Breakfast', 'Collect security badges, hackathon swags, and Wi-Fi credentials.', '09:00 AM', '10:00 AM', 'Lobby Reception', 1),
  ('s2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Opening Ceremony & Track Briefing', 'Keynote address by Principal Sterling and track rules walkthrough.', '10:00 AM', '11:00 AM', 'Main Stage Hall A', 2),
  ('s3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Hacking Begins & Mentor Office Hours', 'Teams start development. Subject-matter experts available in rooms 101-104.', '11:00 AM', '06:00 PM', 'Hacking Arena', 3),
  ('s4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'Dinner & Lightning Tech Demos', 'Warm dinner served alongside 5-minute lightning talks on clean energy.', '07:00 PM', '08:30 PM', 'Dining Hall', 4),
  ('s5555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'Project Submissions & Code Freeze', 'Push repositories and deploy functional links to review portal.', '04:00 PM', '05:00 PM', 'Online Submission Portal', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CHALLENGE CONTENT
INSERT INTO public.challenge_content (id, event_id, title, problem_statement, objectives, rules, resources) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'GreenPulse Campus Net-Zero Challenge',
    'Develop scalable software solutions to measure, gamify, and actively reduce energy consumption, lab equipment idle times, and cafeteria food waste across university premises.',
    '["Prototype a live dashboard with simulated IoT sensor metrics", "Provide actionable carbon reduction recommendations to facilities team", "Include peer-to-peer student engagement incentives"]'::jsonb,
    '["Teams may consist of 2 to 4 registered participants", "All code written must be original or open-source with proper licensing", "Submissions must include a live URL and a 2-minute video pitch", "AI coding tools are permitted but architecture must be defensible"]'::jsonb,
    '[{"title": "Campus Sustainability API Specs", "url": "https://api.campusgreen.edu/docs", "type": "doc"}, {"title": "Sample Telemetry Dataset", "url": "https://github.com/campus-green/sample-iot", "type": "dataset"}, {"title": "Design System Figma Starter", "url": "https://figma.com/@campus/cleanui", "type": "guide"}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 6. SEED TICKETS & UPDATES
INSERT INTO public.tickets (id, event_id, created_by, assigned_to, category, subject, description, priority, status, resolution_note) VALUES
  (
    't1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'Technical',
    'Wi-Fi 6E SSID credentials not connecting on Linux machines',
    'Several students in Hall A table 4 are unable to authenticate against campus-guest network with provided passphrase.',
    'high',
    'in_progress',
    NULL
  ),
  (
    't2222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'a3333333-3333-3333-3333-333333333333',
    'Registration',
    'Request dietary accommodation for vegan lunch',
    'Would like to ensure the lunch catering has marked vegan boxes for team 12.',
    'low',
    'resolved',
    'Notified catering leads Maya and Marco. Box #12 tagged with attendee name.'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ticket_updates (id, ticket_id, updated_by, old_status, new_status, note) VALUES
  (
    'u1111111-1111-1111-1111-111111111111',
    't1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'open',
    'in_progress',
    'Contacted IT Network Operations. They are provisioning a secondary WPA2 PSK band for legacy OS compatibility.'
  ),
  (
    'u2222222-2222-2222-2222-222222222222',
    't2222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    'in_progress',
    'resolved',
    'Catering confirmation confirmed. Dietary stickers prepared.'
  )
ON CONFLICT (id) DO NOTHING;
