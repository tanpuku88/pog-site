-- POGサイト 初期スキーマ
-- Supabase の SQL Editor にこのファイルの中身を貼り付けて実行する。

-- ========== テーブル ==========

-- 参加者の表示名（auth.users と 1対1）
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '名無し',
  created_at timestamptz not null default now()
);

-- POGグループ（大会）
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  crop_year int not null,                         -- 対象世代（生まれ年）。2026-27シーズンなら 2024
  picks_per_member int not null default 10,
  season_start date not null,                     -- 集計開始日
  season_end date not null,                       -- 集計終了日（日本ダービー当日）
  include_non_jra boolean not null default false, -- 地方・海外の賞金を含めるか
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- 競走馬（netkeiba の馬ID をそのまま主キーにする）
create table if not exists public.horses (
  id text primary key,
  name text not null,
  sex text,
  birth_year int,
  sire text,
  dam text,
  damsire text,
  trainer text,
  owner text,
  breeder text,
  results_fetched_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists horses_birth_year_idx on public.horses (birth_year);

-- 成績（1頭1日1レース）
create table if not exists public.race_results (
  horse_id text not null references public.horses (id) on delete cascade,
  race_date date not null,
  venue text not null,
  race_name text not null,
  race_id text,
  finish text,           -- 着順（「1」「中止」など文字列のまま）
  prize_man numeric not null default 0, -- 本賞金（万円）
  is_jra boolean not null,
  primary key (horse_id, race_date, race_name)
);

-- 出走予定
create table if not exists public.entries (
  horse_id text not null references public.horses (id) on delete cascade,
  race_id text not null,
  race_date date not null,
  venue text,
  race_no int,
  race_name text,
  post_time text,
  primary key (horse_id, race_id)
);

-- 指名
create table if not exists public.picks (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  horse_id text not null references public.horses (id),
  created_at timestamptz not null default now(),
  primary key (group_id, horse_id) -- 同じグループ内で同じ馬は1人だけ
);
create index if not exists picks_user_idx on public.picks (group_id, user_id);

-- ========== 関数・トリガー ==========

-- 新規ユーザーに profiles 行を作る
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- グループ作成者を自動でメンバーにする
create or replace function public.add_owner_as_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.group_members (group_id, user_id) values (new.id, new.owner_id)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_group_created on public.groups;
create trigger on_group_created
  after insert on public.groups
  for each row execute function public.add_owner_as_member();

-- 指名頭数の上限チェック
create or replace function public.check_pick_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  lim int;
  cnt int;
begin
  select picks_per_member into lim from public.groups where id = new.group_id;
  select count(*) into cnt from public.picks where group_id = new.group_id and user_id = new.user_id;
  if cnt >= lim then
    raise exception '指名できるのは%頭までです', lim using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists on_pick_insert on public.picks;
create trigger on_pick_insert
  before insert on public.picks
  for each row execute function public.check_pick_limit();

-- 招待コードでグループに参加
create or replace function public.join_group(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
begin
  if auth.uid() is null then
    raise exception 'ログインが必要です';
  end if;
  select id into gid from public.groups where invite_code = code;
  if gid is null then
    raise exception '招待リンクが正しくありません';
  end if;
  insert into public.group_members (group_id, user_id) values (gid, auth.uid())
  on conflict do nothing;
  return gid;
end $$;

-- 自分が所属するグループか
create or replace function public.is_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid());
$$;

-- ========== RLS ==========

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.horses enable row level security;
alter table public.race_results enable row level security;
alter table public.entries enable row level security;
alter table public.picks enable row level security;

-- profiles: ログインユーザーは誰でも読める。自分の行だけ更新できる
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- groups: メンバーだけ読める。誰でも作れる（自分がオーナー）。オーナーだけ更新・削除
drop policy if exists groups_read on public.groups;
create policy groups_read on public.groups for select to authenticated
  using (public.is_member(id) or owner_id = auth.uid());
drop policy if exists groups_insert on public.groups;
create policy groups_insert on public.groups for insert to authenticated
  with check (owner_id = auth.uid());
drop policy if exists groups_update on public.groups;
create policy groups_update on public.groups for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists groups_delete on public.groups;
create policy groups_delete on public.groups for delete to authenticated
  using (owner_id = auth.uid());

-- group_members: 同じグループのメンバー一覧を読める。自分の脱退だけできる（参加は join_group 経由）
drop policy if exists members_read on public.group_members;
create policy members_read on public.group_members for select to authenticated
  using (public.is_member(group_id));
drop policy if exists members_leave on public.group_members;
create policy members_leave on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- horses / race_results / entries: 誰でも読める。書き込みはサーバー（service role）のみ
drop policy if exists horses_read on public.horses;
create policy horses_read on public.horses for select using (true);
drop policy if exists results_read on public.race_results;
create policy results_read on public.race_results for select using (true);
drop policy if exists entries_read on public.entries;
create policy entries_read on public.entries for select using (true);

-- picks: 同じグループのメンバーは読める。自分の指名だけ追加・削除できる
drop policy if exists picks_read on public.picks;
create policy picks_read on public.picks for select to authenticated
  using (public.is_member(group_id));
drop policy if exists picks_insert on public.picks;
create policy picks_insert on public.picks for insert to authenticated
  with check (user_id = auth.uid() and public.is_member(group_id));
drop policy if exists picks_delete on public.picks;
create policy picks_delete on public.picks for delete to authenticated
  using (user_id = auth.uid());

grant execute on function public.join_group(text) to authenticated;
