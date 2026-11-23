import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupHref, KINDS, shortName, type Kind } from "@/lib/connections";
import { loadCropData } from "@/lib/sires";
import { aggregatePrices, fieldKey, formatPrice, pricedHorses, returnRate, type PriceKind, type SaleGroupRow, type SaleHorseRow } from "@/lib/sales";
import { defaultSeason } from "@/lib/standings";
import { formatMan } from "@/lib/util";
import { DataTabs } from "@/components/DataTabs";

export const revalidate = 3600;
export const metadata = {
  title: `セリ価格と回収率 ${defaultSeason().crop_year}年生まれ2歳馬｜セレクトセールの馬は稼いでいる？ | POG`,
  description: "2歳馬のセリ落札価格・一口クラブの募集総額と、今シーズンの本賞金を比べた回収率。高額馬の今、回収率の高い馬、種牡馬・生産牧場・馬主ごとの回収率をまとめています。",
  alternates: { canonical: "/data/sales" },
};

const Rate = ({ v }: { v: number | null }) =>
  v === null ? <span className="muted">-</span> : <span className={v >= 100 ? "rr-good" : v >= 50 ? "rr-mid" : "rr-low"}>{v.toFixed(v >= 100 ? 0 : 1)}%</span>;

function HorseTable({ rows, showSale }: { rows: SaleHorseRow[]; showSale: boolean }) {
  return (
    <div className="card flush scroll">
      <table className="list sales-table">
        <thead><tr><th className="c">順</th><th>馬名・父</th><th className="num">価格</th><th className="num">成績</th><th className="num">本賞金</th><th className="num">回収率</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.h.id}>
              <td className="c"><span className={`rk rk-${i + 1}`}>{i + 1}</span></td>
              <td className="name-cell">
                <Link className="horse-name" href={`/horse/${r.h.id}`}>{r.h.name}</Link>
                {r.h.sex && <span className={`sex sex-${r.h.sex}`}>{r.h.sex}</span>}
                <div className="ped"><span>父 <b>{r.h.sire ?? "-"}</b>{showSale && r.h.sale_name ? `・${r.h.sale_name}` : ""}</span></div>
              </td>
              <td className="num">{formatPrice(r.price)}</td>
              <td className="num sub">{r.starts === 0 ? "未出走" : `${r.starts}戦${r.wins}勝`}</td>
              <td className="num">{r.prize > 0 ? formatMan(r.prize) : <span className="muted">0</span>}</td>
              <td className="num big"><Rate v={r.rate} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupBox({ title, rows, kind }: { title: string; rows: SaleGroupRow[]; kind?: Kind }) {
  if (rows.length === 0) return null;
  return (
    <section className="box">
      <h3 className="box-head">{title}<small>合計価格の多い順</small></h3>
      <table className="list compact sales-group">
        <thead><tr><th>名前</th><th className="num">頭数</th><th className="num">平均</th><th className="num">回収率</th></tr></thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.name}>
              <td className="g-name">
                {kind ? <Link className="horse-name" href={groupHref(kind, g.name)} title={g.name}>{shortName(g.name)}</Link> : <b>{g.name}</b>}
                <div className="sub">勝ち上がり{g.winners}/{g.starters}{g.best ? `・${g.best.h.name}` : ""}</div>
              </td>
              <td className="num">{g.count}</td>
              <td className="num">{formatPrice(g.avg)}</td>
              <td className="num"><Rate v={g.rate} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind: k } = await searchParams;
  const kind: PriceKind = k === "club" ? "club" : "sale";
  const season = defaultSeason();
  const { horses, tally } = await loadCropData(createAdminClient(), season.crop_year, { ...season, include_non_jra: true });
  const checked = horses.filter((h) => h.sale_checked_at).length;
  const rows = pricedHorses(horses, tally, kind);
  const total = rows.reduce((s, r) => s + r.price, 0);
  const prize = rows.reduce((s, r) => s + r.prize, 0);
  const paidBack = rows.filter((r) => (r.rate ?? 0) >= 100).length;
  const byPrice = [...rows].sort((a, b) => b.price - a.price).slice(0, 30);
  const byRate = rows.filter((r) => r.prize > 0).sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0)).slice(0, 20);
  const top = (key: Parameters<typeof aggregatePrices>[1], min = 3) =>
    aggregatePrices(rows, key).filter((g) => g.count >= min).sort((a, b) => b.total - a.total).slice(0, 15);
  const bySale = kind === "sale" ? aggregatePrices(rows, (h) => h.sale_name ?? null).sort((a, b) => b.total - a.total) : [];
  const label = kind === "sale" ? "セリ" : "一口クラブ";

  return (
    <>
      <DataTabs current="sales" />
      <h1 style={{ marginBottom: 4 }}>{season.crop_year}年生まれ セリ価格と回収率</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        「あのセレクトセールの高額馬は、いくら稼いでいる？」を数字で見るページです。
        回収率は <b>今シーズンの本賞金 ÷ 価格</b>（中央・地方、2歳6月〜ダービーまで）。出走手当や付加賞は入らないので、実際の回収より少し低めに出る目安です。
      </p>
      <div className="seg" style={{ marginBottom: 12 }}>
        <Link href="/data/sales" className={kind === "sale" ? "on" : ""}>セリで買われた馬</Link>
        <Link href="/data/sales?kind=club" className={kind === "club" ? "on" : ""}>一口クラブの募集馬</Link>
      </div>

      <div className="stats">
        <div className="stat"><div className="k">{label}の馬</div><div className="v">{rows.length.toLocaleString()}<small>頭</small></div><div className="s">確認済み{checked.toLocaleString()}/{horses.length.toLocaleString()}頭</div></div>
        <div className="stat"><div className="k">平均{kind === "sale" ? "落札価格" : "募集総額"}</div><div className="v">{rows.length ? formatPrice(Math.round(total / rows.length)) : "-"}<small>円</small></div><div className="s">合計 {formatPrice(Math.round(total))}円</div></div>
        <div className="stat"><div className="k">全体の回収率</div><div className="v"><Rate v={returnRate(prize, total)} /></div><div className="s">本賞金の合計 {formatMan(Math.round(prize))}万円</div></div>
        <div className="stat"><div className="k">もう元を取った馬</div><div className="v">{paidBack}<small>頭</small></div><div className="s">回収率100%以上</div></div>
      </div>
      {checked < horses.length && (
        <p className="ext-note">いま全馬の価格を順番に確認しています。確認が進むと数字が増えていきます。</p>
      )}

      {rows.length === 0 ? (
        <div className="card muted" style={{ marginTop: 12 }}>まだデータがありません。価格の確認が進むと表示されます。</div>
      ) : (
        <div className="layout-2col">
          <div>
            <div className="sec-title"><h2>高額馬の今</h2><span className="muted">{kind === "sale" ? "落札価格" : "募集総額"}の高い順</span></div>
            <HorseTable rows={byPrice} showSale={kind === "sale"} />
            <div className="sec-title"><h2>回収率の高い馬</h2><span className="muted">本賞金 ÷ 価格</span></div>
            <HorseTable rows={byRate} showSale={kind === "sale"} />
          </div>
          <div className="side">
            {kind === "sale" && <GroupBox title="セリ別" rows={bySale} />}
            <GroupBox title="種牡馬別" rows={top(fieldKey("sire"))} kind={KINDS.sire} />
            {kind === "sale" && <GroupBox title="生産牧場別" rows={top(fieldKey("breeder"))} kind={KINDS.breeder} />}
            <GroupBox title={kind === "sale" ? "馬主別（落札後の馬主）" : "クラブ別"} rows={top(fieldKey("owner"), kind === "sale" ? 2 : 1)} kind={KINDS.owner} />
          </div>
        </div>
      )}
      <p className="ext-note">
        募集総額は「1口の価格 × 口数」で計算しています。
      </p>
    </>
  );
}
