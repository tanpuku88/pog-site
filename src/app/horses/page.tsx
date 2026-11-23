import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultSeason } from "@/lib/standings";
import { MarkBadges, MarkLegend } from "@/components/HorseLabel";
import { loadHorseMarks } from "@/lib/horse-marks-server";

export const metadata: Metadata = {
  title: { absolute: "POG 馬を探す｜2歳馬の血統・成績・指名数" },
  description: "POGで指名する2歳馬を馬名・父・母から検索。血統、成績、厩舎、指名数をまとめて見られます。",
  alternates: { canonical: "/horses" },
};

type Hit = { id: string; name: string; sex: string | null; birth_year: number | null; sire: string | null; dam: string | null; trainer: string | null };

export default async function HorsesSearch({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = (raw ?? "").replace(/[%,()*]/g, "").trim().slice(0, 30);
  const season = defaultSeason();
  let hits: Hit[] = [];
  if (q) {
    const { data } = await createAdminClient()
      .from("horses")
      .select("id, name, sex, birth_year, sire, dam, trainer")
      .or(`name.ilike.%${q}%,sire.ilike.%${q}%,dam.ilike.%${q}%`)
      .order("birth_year", { ascending: false })
      .order("name")
      .limit(100);
    hits = (data ?? []) as Hit[];
  }
  const marks = hits.length ? await loadHorseMarks() : undefined;
  return (
    <>
      <h1>馬を探す</h1>
      <form className="card row" method="get" style={{ gap: 8 }}>
        <input name="q" defaultValue={q} placeholder="馬名・父・母の一部（例：ディープ、エピファネイア）" aria-label="馬名・父・母" />
        <button>探す</button>
      </form>
      {!q ? (
        <p className="muted">{season.crop_year}年生まれ世代を中心に登録しています。種牡馬から探すときは <Link href="/sires">種牡馬ランキング</Link> へ。</p>
      ) : hits.length === 0 ? (
        <div className="card muted">「{q}」に当てはまる馬は見つかりませんでした。</div>
      ) : (
        <>
        <MarkLegend />
        <div className="card flush scroll">
          <table className="list">
            <thead><tr><th>馬名</th><th>父</th><th>母</th><th className="hide-sm">厩舎</th><th className="num">生年</th></tr></thead>
            <tbody>
              {hits.map((h) => (
                <tr key={h.id}>
                  <td><Link className="horse-name" href={`/horse/${h.id}`}>{h.name}</Link>{h.sex && <span className={`sex sex-${h.sex}`}>{h.sex}</span>}<MarkBadges id={h.id} trainer={h.trainer} marks={marks} /></td>
                  <td>{h.sire ? <Link href={`/sires/${encodeURIComponent(h.sire)}`}>{h.sire}</Link> : ""}</td>
                  <td className="sub">{h.dam ?? ""}</td>
                  <td className="hide-sm sub">{h.trainer ?? ""}</td>
                  <td className="num sub">{h.birth_year ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  );
}
