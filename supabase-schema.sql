create table if not exists public.fitai_users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fitai_profiles (
  user_id uuid primary key references public.fitai_users(id) on delete cascade,
  name text not null default '',
  goal text,
  activity text,
  goal_cal integer not null default 2100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fitai_food_logs (
  id uuid primary key,
  user_id uuid not null references public.fitai_users(id) on delete cascade,
  meal text not null default 'Snack',
  name text not null,
  qty text not null default '1 serving',
  cal numeric not null default 0,
  prot numeric not null default 0,
  carb numeric not null default 0,
  fat numeric not null default 0,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.fitai_workout_logs (
  id uuid primary key,
  user_id uuid not null references public.fitai_users(id) on delete cascade,
  exercise text not null,
  sets jsonb not null default '[]'::jsonb,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.fitai_weight_logs (
  id uuid primary key,
  user_id uuid not null references public.fitai_users(id) on delete cascade,
  weight_kg numeric not null,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.fitai_users enable row level security;
alter table public.fitai_profiles enable row level security;
alter table public.fitai_food_logs enable row level security;
alter table public.fitai_workout_logs enable row level security;
alter table public.fitai_weight_logs enable row level security;

grant select, insert, update, delete on table public.fitai_users to service_role;
grant select, insert, update, delete on table public.fitai_profiles to service_role;
grant select, insert, update, delete on table public.fitai_food_logs to service_role;
grant select, insert, update, delete on table public.fitai_workout_logs to service_role;
grant select, insert, update, delete on table public.fitai_weight_logs to service_role;

revoke all on table public.fitai_users from anon, authenticated;
revoke all on table public.fitai_profiles from anon, authenticated;
revoke all on table public.fitai_food_logs from anon, authenticated;
revoke all on table public.fitai_workout_logs from anon, authenticated;
revoke all on table public.fitai_weight_logs from anon, authenticated;
