-- ============================================
-- Monstah Micro Learning — Supabase Database Schema
-- Copy and paste this into Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================

-- 1. Create User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  odometer INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_active_date DATE,
  completed_lessons TEXT[] DEFAULT '{}',
  topic_progress JSONB DEFAULT '{}'::jsonb,
  quiz_scores JSONB DEFAULT '{}'::jsonb,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create User Custom Topics Table (for AI generated topics saved to user accounts)
CREATE TABLE IF NOT EXISTS public.user_custom_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  topic_data JSONB NOT NULL,
  lesson_data JSONB NOT NULL,
  quiz_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_topics ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_progress FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress FOR UPDATE 
USING (auth.uid() = id);

-- 5. Create RLS Policies for user_custom_topics
CREATE POLICY "Users can view their own custom topics" 
ON public.user_custom_topics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom topics" 
ON public.user_custom_topics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom topics" 
ON public.user_custom_topics FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Trigger to automatically create user_progress when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (id, streak, longest_streak, odometer, level)
  VALUES (new.id, 0, 0, 0, 1)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
