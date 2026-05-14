create table if not exists public.fitai_users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  reset_token_hash text,
  reset_token_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.fitai_users add column if not exists reset_token_hash text;
alter table public.fitai_users add column if not exists reset_token_expires_at timestamptz;

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

create table if not exists public.fitai_nutrition_items (
  id uuid primary key default gen_random_uuid(),
  keys text[] not null,
  serving numeric not null,
  unit text not null,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  micros jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fitai_users enable row level security;
alter table public.fitai_profiles enable row level security;
alter table public.fitai_food_logs enable row level security;
alter table public.fitai_workout_logs enable row level security;
alter table public.fitai_weight_logs enable row level security;
alter table public.fitai_nutrition_items enable row level security;

grant select, insert, update, delete on table public.fitai_users to service_role;
grant select, insert, update, delete on table public.fitai_profiles to service_role;
grant select, insert, update, delete on table public.fitai_food_logs to service_role;
grant select, insert, update, delete on table public.fitai_workout_logs to service_role;
grant select, insert, update, delete on table public.fitai_weight_logs to service_role;
grant select, insert, update, delete on table public.fitai_nutrition_items to service_role;

revoke all on table public.fitai_users from anon, authenticated;
revoke all on table public.fitai_profiles from anon, authenticated;
revoke all on table public.fitai_food_logs from anon, authenticated;
revoke all on table public.fitai_workout_logs from anon, authenticated;
revoke all on table public.fitai_weight_logs from anon, authenticated;
revoke all on table public.fitai_nutrition_items from anon, authenticated;

create unique index if not exists fitai_nutrition_items_primary_key_idx
  on public.fitai_nutrition_items ((lower(keys[1])));

insert into public.fitai_nutrition_items (keys, serving, unit, calories, protein, carbs, fat, micros)
values
  (array['rice', 'cooked rice', 'white rice'], 100, 'g', 130, 3, 28, 0, '{"iron":1,"magnesium":3,"zinc":4}'::jsonb),
  (array['brown rice'], 100, 'g', 123, 3, 26, 1, '{"iron":3,"magnesium":11,"zinc":8}'::jsonb),
  (array['roti', 'chapati'], 1, 'piece', 110, 4, 18, 3, '{"iron":6,"magnesium":8,"zinc":5}'::jsonb),
  (array['paratha'], 1, 'piece', 260, 6, 36, 10, '{"iron":8,"magnesium":8,"zinc":5}'::jsonb),
  (array['egg', 'eggs', 'boiled egg'], 1, 'piece', 72, 6, 0, 5, '{"vitaminA":6,"vitaminB12":18,"vitaminD":6,"iron":3,"zinc":5}'::jsonb),
  (array['chicken', 'chicken breast'], 100, 'g', 165, 31, 0, 4, '{"vitaminB12":13,"iron":5,"magnesium":7,"zinc":9}'::jsonb),
  (array['fish'], 100, 'g', 140, 22, 0, 5, '{"vitaminB12":90,"vitaminD":35,"iron":5,"magnesium":8,"zinc":5}'::jsonb),
  (array['paneer'], 100, 'g', 265, 18, 6, 20, '{"vitaminA":8,"vitaminB12":20,"calcium":35,"zinc":8}'::jsonb),
  (array['tofu'], 100, 'g', 76, 8, 2, 5, '{"calcium":20,"iron":15,"magnesium":8,"zinc":6}'::jsonb),
  (array['dal', 'lentils'], 100, 'g', 116, 9, 20, 0, '{"iron":18,"magnesium":9,"zinc":8}'::jsonb),
  (array['chana', 'chickpeas'], 100, 'g', 164, 9, 27, 3, '{"iron":16,"magnesium":12,"zinc":12}'::jsonb),
  (array['rajma', 'kidney beans'], 100, 'g', 127, 9, 23, 1, '{"iron":14,"magnesium":11,"zinc":7}'::jsonb),
  (array['oats'], 100, 'g', 389, 17, 66, 7, '{"iron":26,"magnesium":42,"zinc":26}'::jsonb),
  (array['milk'], 100, 'ml', 61, 3, 5, 3, '{"vitaminA":5,"vitaminB12":20,"vitaminD":6,"calcium":12}'::jsonb),
  (array['curd', 'yogurt'], 100, 'g', 61, 4, 5, 3, '{"vitaminB12":15,"calcium":12,"zinc":5}'::jsonb),
  (array['banana'], 1, 'piece', 105, 1, 27, 0, '{"vitaminC":11,"magnesium":8}'::jsonb),
  (array['apple'], 1, 'piece', 95, 1, 25, 0, '{"vitaminC":8}'::jsonb),
  (array['bread'], 1, 'slice', 80, 3, 15, 1, '{"iron":6,"calcium":4}'::jsonb),
  (array['potato'], 100, 'g', 87, 2, 20, 0, '{"vitaminC":22,"magnesium":6,"iron":4}'::jsonb),
  (array['sweet potato'], 100, 'g', 86, 2, 20, 0, '{"vitaminA":80,"vitaminC":4,"magnesium":6}'::jsonb),
  (array['peanut butter'], 1, 'tbsp', 95, 4, 4, 8, '{"magnesium":7,"zinc":4}'::jsonb),
  (array['almonds'], 10, 'piece', 70, 3, 3, 6, '{"calcium":3,"iron":4,"magnesium":12,"zinc":5}'::jsonb),
  (array['peanuts'], 100, 'g', 567, 26, 16, 49, '{"iron":25,"magnesium":40,"zinc":30}'::jsonb),
  (array['whey protein', 'protein powder'], 1, 'scoop', 120, 24, 3, 2, '{"calcium":12,"vitaminB12":20}'::jsonb)
on conflict do nothing;
