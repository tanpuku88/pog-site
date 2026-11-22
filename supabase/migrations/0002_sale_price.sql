-- セリの落札価格・一口クラブの募集総額（netkeiba の馬ページのプロフィールから）
-- Supabase の SQL Editor にこのファイルの中身を貼り付けて実行する。何度実行しても大丈夫。
alter table public.horses add column if not exists sale_price_man numeric;   -- セリの落札価格（万円）
alter table public.horses add column if not exists sale_name text;           -- セリの名前（セレクトセールなど）
alter table public.horses add column if not exists sale_year int;            -- セリの年
alter table public.horses add column if not exists club_price_man numeric;   -- 一口クラブの募集総額（万円）
alter table public.horses add column if not exists sale_checked_at timestamptz; -- 価格を確認した日時
create index if not exists horses_sale_check_idx on public.horses (birth_year, sale_checked_at);
