-- Run this in the Supabase SQL Editor to create the required tables

-- 1. Create schemes table
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  eligible_occupations TEXT[] NOT NULL,
  income_limit INTEGER,
  min_age INTEGER,
  max_age INTEGER,
  states TEXT[] NOT NULL,
  documents TEXT[] NOT NULL,
  benefit_summary TEXT NOT NULL,
  apply_steps TEXT[] NOT NULL,
  target_groups TEXT[] DEFAULT '{}',
  scheme_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_queries table
CREATE TABLE user_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  detected_occupation TEXT,
  detected_income INTEGER,
  detected_state TEXT,
  detected_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create analysis_results table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID REFERENCES user_queries(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS) policies
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- schemes table: allow SELECT for anon role (public read access)
CREATE POLICY "Allow public read access for schemes" ON schemes FOR SELECT USING (true);

-- user_queries & analysis_results: 
-- (By not creating any policies for anon/authenticated roles, we block public writes/reads automatically.
-- The backend uses the Service Role Key, which bypasses RLS and can INSERT/SELECT freely.)
