-- 成績に馬場（芝・ダ・障）と距離を足す（種牡馬・厩舎などの適性を出すため）
-- Supabase の SQL Editor にこのファイルの中身を貼り付けて実行する。何度実行しても大丈夫。
alter table public.race_results add column if not exists surface text;  -- 芝 / ダ / 障
alter table public.race_results add column if not exists distance int;  -- 距離（m）
