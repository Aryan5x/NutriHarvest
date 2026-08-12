-- ==========================================
-- NUTRIHARVEST AI - SUPABASE SCHEMA & RLS
-- ==========================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  farmer_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies (Users can only access their own profile)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- 2. FARMER ONBOARDING TABLE
CREATE TABLE IF NOT EXISTS public.farmer_onboarding (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  household_size INTEGER NOT NULL,
  diet_preference TEXT NOT NULL,
  age_groups JSONB NOT NULL,
  land_area_acres NUMERIC NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  water_source TEXT NOT NULL,
  budget_inr NUMERIC NOT NULL,
  soil_type TEXT NOT NULL,
  soil_ph NUMERIC NOT NULL,
  soil_nitrogen NUMERIC NOT NULL,
  soil_phosphorus NUMERIC NOT NULL,
  crop_history JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.farmer_onboarding ENABLE ROW LEVEL SECURITY;

-- Onboarding RLS Policies (Users can only access their own onboarding record)
CREATE POLICY "Users can view their own onboarding data"
  ON public.farmer_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data"
  ON public.farmer_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
  ON public.farmer_onboarding FOR UPDATE
  USING (auth.uid() = user_id);
