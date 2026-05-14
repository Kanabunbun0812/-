-- Supabase schema draft for production version

create table rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  room_name text not null,
  table_shape text not null default 'round',
  seat_count int not null,
  phase text not null default 'entry',
  allow_multiple boolean not null default true,
  max_votes int not null default 2,
  is_paid boolean not null default false,
  created_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  seat_id text not null,
  name text not null,
  gender text not null,
  avatar text,
  created_at timestamptz not null default now(),
  unique(room_id, seat_id)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  from_member_id uuid references members(id) on delete cascade,
  to_member_id uuid references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(room_id, from_member_id, to_member_id)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete set null,
  stripe_session_id text,
  amount_yen int,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
