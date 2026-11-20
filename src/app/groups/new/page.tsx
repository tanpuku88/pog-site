import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { defaultSeason } from "@/lib/standings";
import { createGroup } from "./actions";

export default async function NewGroup() {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/groups/new");
  const d = defaultSeason();
  return (
    <>
      <h1>グループを作る</h1>
      <form action={createGroup} className="card">
        <label htmlFor="name">グループ名</label>
        <input id="name" name="name" required maxLength={40} placeholder="例：〇〇POG 2026-27" />
        <label htmlFor="picks">1人あたりの指名頭数</label>
        <input id="picks" name="picks_per_member" type="number" min={1} max={50} defaultValue={10} />
        <label htmlFor="crop">対象の世代（生まれ年）</label>
        <input id="crop" name="crop_year" type="number" defaultValue={d.crop_year} />
        <label htmlFor="start">集計開始日</label>
        <input id="start" name="season_start" type="date" defaultValue={d.season_start} />
        <label htmlFor="end">集計終了日（日本ダービー当日）</label>
        <input id="end" name="season_end" type="date" defaultValue={d.season_end} />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="include_non_jra" style={{ width: "auto" }} /> 地方・海外の賞金もポイントに含める
        </label>
        <p className="muted">ポイントは期間中の本賞金（万円）の合計です。あとから設定で変更できます。</p>
        <button>作成する</button>
      </form>
    </>
  );
}
