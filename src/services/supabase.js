// src/services/supabase.js
// ─────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a free account
// 2. Click "New project" and give it a name like "fitai"
// 3. Go to Project Settings → API
// 4. Copy your "Project URL" and "anon public" key
// 5. Paste them below replacing the placeholder values
// ─────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nggqwjjkxjuahgnfksfo.supabase.co';   // ← paste your URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ3F3ampreGp1YWhnbmZrc2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTMxMTUsImV4cCI6MjA5Mzk2OTExNX0.nUz55IIt8pzUkvMRQRTS04KX0k4cXbjUW4ht6uoQAig';               // ← paste your key here

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─────────────────────────────────────────────────────────────
// DATABASE TABLES — Run this SQL in Supabase → SQL Editor
// ─────────────────────────────────────────────────────────────
//
// -- Users profile table
// create table profiles (
//   id uuid references auth.users primary key,
//   name text,
//   age int,
//   weight_kg float,
//   height_cm float,
//   goal text,
//   activity_level text,
//   diet_type text,
//   cuisine_preference text,
//   meals_per_day int,
//   created_at timestamp default now()
// );
//
// -- Food log table
// create table food_logs (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users,
//   meal_type text,  -- Breakfast, Lunch, Dinner, Snack
//   name text,
//   quantity text,
//   calories int,
//   protein_g float,
//   carbs_g float,
//   fat_g float,
//   logged_at date default current_date,
//   created_at timestamp default now()
// );
//
// -- Workout log table
// create table workout_logs (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users,
//   exercise_name text,
//   sets jsonb,  -- [{set: 1, reps: 10, weight_kg: 60}, ...]
//   logged_at date default current_date,
//   created_at timestamp default now()
// );
//
// -- Body weight progress
// create table weight_logs (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users,
//   weight_kg float,
//   logged_at date default current_date
// );
//
// -- Enable Row Level Security on all tables
// alter table profiles enable row level security;
// alter table food_logs enable row level security;
// alter table workout_logs enable row level security;
// alter table weight_logs enable row level security;
//
// -- RLS policies (users can only see their own data)
// create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);
// create policy "Users can manage own food logs" on food_logs for all using (auth.uid() = user_id);
// create policy "Users can manage own workout logs" on workout_logs for all using (auth.uid() = user_id);
// create policy "Users can manage own weight logs" on weight_logs for all using (auth.uid() = user_id);
// ─────────────────────────────────────────────────────────────
