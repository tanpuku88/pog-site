-- 新馬戦予想の第2段階（騎手）用に、騎手名を保存できるようにする。
-- entries.jockey: 出馬表で決まっている騎手（想定段階では null のことが多い）
-- race_results.jockey: そのレースで騎っていた騎手（デビュー戦の集計に使う）
alter table public.entries add column if not exists jockey text;
alter table public.race_results add column if not exists jockey text;
