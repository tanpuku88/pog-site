import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { defaultSeason } from "@/lib/standings";
import { createGroup } from "./actions";
import RulesFields from "@/components/RulesFields";
import { DEFAULT_PRESET } from "@/lib/group-rules";

export default async function NewGroup() {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/groups/new");
  const d = defaultSeason();
  return (
    <>
      <h1>グループを作る</h1>
      <form action={createGroup} className="card">
        <label htmlFor="name">グループ名</label>
        <input id="name" name="name" required maxLength={40} placeholder="例：〇〇POG 2027-28" />
        <RulesFields picks={DEFAULT_PRESET.picks} cropYear={d.crop_year} seasonStart={d.season_start} seasonEnd={d.season_end} rules={DEFAULT_PRESET.rules} collapsed />
        <p className="muted">迷ったら「定番」のままで大丈夫です。指名が始まる前なら、あとから設定で変更できます。</p>
        <button>作成する</button>
      </form>
    </>
  );
}
