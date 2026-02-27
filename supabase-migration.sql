-- ═══════════════════════════════════════════════════════════════════════
-- HHT CRM — Supabase Database Migration
-- Run this in your Supabase SQL Editor when ready for multi-user persistence
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (extends Supabase Auth) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  avatar TEXT, -- initials like "JS"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Leads (the CRM core) ──
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  postcode TEXT,
  category TEXT,
  capacity INTEGER,
  website TEXT,
  notes TEXT,
  stage TEXT DEFAULT 'Identified' CHECK (stage IN (
    'Identified', 'Researched', 'Contacted', 'Responded',
    'Qualified', 'Meeting Booked', 'Won', 'Lost'
  )),
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_value DECIMAL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT DEFAULT 'Manual',
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  lat DECIMAL,
  lng DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Activities (timeline of interactions) ──
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'stage_change', 'created')),
  description TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes for performance ──
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);

-- ── Auto-update timestamps ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read/write all data (team-wide access)
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Leads are viewable by authenticated users" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Activities are viewable by authenticated users" ON public.activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Seed HHT team members (run after team members sign up) ──
-- INSERT INTO public.profiles (id, name, role, avatar) VALUES
--   ('<joe-uuid>', 'Joe Stokoe', 'Director & Founder', 'JS'),
--   ('<matt-uuid>', 'Matt Robertson', 'Head of Studio', 'MR'),
--   ('<emily-uuid>', 'Emily Blacklock', 'Head of Events', 'EB'),
--   ('<seb-uuid>', 'Seb Davis', 'Project Manager & Stylist', 'SD'),
--   ('<jason-uuid>', 'Jason Sales', 'Senior Events Manager', 'JSa'),
--   ('<anja-uuid>', 'Anja Rubin', 'Events Manager', 'AR'),
--   ('<katy-uuid>', 'Katy Kedslie', 'Events Coordinator', 'KK');
