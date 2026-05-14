-- ============================================================
-- Mutual Match: DB Upgrade SQL
-- Supabase SQL Editor で実行してください。
-- 開発中のため、既存の votes データは消えます。
-- ============================================================

-- 1. rooms に current_round カラムを追加
alter table rooms
  add column if not exists current_round int not null default 1;

-- 2. rooms に target_mode カラムを追加（異性のみ / 全員）
alter table rooms
  add column if not exists target_mode text not null default 'opposite';

-- 3. rooms に expires_at カラムを追加（24時間後削除用）
alter table rooms
  add column if not exists expires_at timestamptz not null default (now() + interval '24 hours');

-- 4. votes テーブルを再作成（round_number カラム追加）
-- 開発中のため既存投票データは消えてOKの前提
drop table if exists votes;

create table votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  round_number int not null default 1,
  from_member_id uuid references members(id) on delete cascade,
  to_member_id uuid references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(room_id, round_number, from_member_id, to_member_id)
);

-- ============================================================
-- 完了後の確認
-- ============================================================
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'rooms'
-- order by ordinal_position;
--
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_name = 'votes'
-- order by ordinal_position;
