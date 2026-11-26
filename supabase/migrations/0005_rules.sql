-- 大会ごとのルール（2027年シーズン〜）
-- Supabase の SQL Editor にこのファイルの中身を貼り付けて実行する。何度実行しても大丈夫。
-- rules が空（null）の大会は、今までどおり「本賞金の合計」で計算する。
alter table public.groups add column if not exists rules jsonb;

-- 指名頭数の上限チェックに、牡馬・牝馬の頭数のチェックを足す（セン馬は牡馬に数える）
create or replace function public.check_pick_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  lim int;
  r jsonb;
  cnt int;
  hsex text;
  cap int;
  used int;
begin
  select picks_per_member, rules into lim, r from public.groups where id = new.group_id;
  select count(*) into cnt from public.picks where group_id = new.group_id and user_id = new.user_id;
  if cnt >= lim then
    raise exception '指名できるのは%頭までです', lim using errcode = 'P0001';
  end if;

  if r is not null and jsonb_typeof(r -> 'male') = 'number' and jsonb_typeof(r -> 'female') = 'number' then
    select sex into hsex from public.horses where id = new.horse_id;
    if hsex in ('牡', 'セ', '牝') then
      cap := case when hsex = '牝' then (r ->> 'female')::int else (r ->> 'male')::int end;
      select count(*) into used
        from public.picks p join public.horses h on h.id = p.horse_id
        where p.group_id = new.group_id and p.user_id = new.user_id
          and (case when hsex = '牝' then h.sex = '牝' else h.sex in ('牡', 'セ') end);
      if used >= cap then
        raise exception '%は%頭までです', case when hsex = '牝' then '牝馬' else '牡馬' end, cap using errcode = 'P0001';
      end if;
    end if;
  end if;
  return new;
end $$;
