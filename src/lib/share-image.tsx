import { ImageResponse } from "next/og";
import type { ShareData } from "@/lib/share-data";
import { ogFonts } from "@/lib/og-font";
import { SITE_URL } from "@/config/site";

// 色はサイトのヘッダー帯（--head / --gold）に合わせる
const C = { bg: "#0f3324", bg2: "#16482f", text: "#f3f6f2", muted: "#a9bdb0", gold: "#c9a227", silver: "#c3cbd0", bronze: "#d08a4f", line: "rgba(255,255,255,0.14)", row: "rgba(255,255,255,0.06)" };
const man = (n: number) => Math.round(n).toLocaleString("ja-JP");
const rankColor = (r: number) => (r === 1 ? C.gold : r === 2 ? C.silver : r === 3 ? C.bronze : C.text);
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const host = SITE_URL.replace(/^https?:\/\//, "");

function Frame({ label, title, note, children }: { label: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bg2} 100%)`, color: C.text, fontFamily: "Noto Sans JP", padding: "40px 52px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", background: C.gold, color: C.bg, fontSize: 22, fontWeight: 900, padding: "4px 14px", borderRadius: 6 }}>{label}</div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 900 }}>{cut(title, 26)}</div>
      </div>
      <div style={{ display: "flex", flex: 1, marginTop: 24, marginBottom: 18, minHeight: 0, overflow: "hidden" }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.line}`, paddingTop: 14, fontSize: 20, color: C.muted }}>
        <div style={{ display: "flex" }}>{note ?? "POG大会を無料で開ける"}</div>
        <div style={{ display: "flex", color: C.text, fontWeight: 900 }}>{host}</div>
      </div>
    </div>
  );
}

function MemberImage({ d }: { d: ShareData }) {
  const m = d.member!;
  const name = d.names.get(m.user_id) ?? "名無し";
  const rows = m.horses.slice(0, 10);
  const big = rows.length <= 6;
  return (
    <Frame label="指名リスト" title={d.group.name} note={m.horses.length > rows.length ? `上位${rows.length}頭（全${m.horses.length}頭）` : undefined}>
      <div style={{ display: "flex", flexDirection: "column", width: 330, paddingRight: 30, borderRight: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 900 }}>{cut(name, 9)}</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 26 }}>
          <div style={{ display: "flex", fontSize: 110, fontWeight: 900, lineHeight: 1, color: rankColor(m.rank) }}>{m.rank}</div>
          <div style={{ display: "flex", fontSize: 32, marginLeft: 8 }}>位</div>
          <div style={{ display: "flex", fontSize: 26, marginLeft: 10, color: C.muted }}>／ {d.standings.length}人</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 26 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 900, color: C.gold }}>{man(m.points)}</div>
          <div style={{ display: "flex", fontSize: 26, marginLeft: 6 }}>万円</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: C.muted, marginTop: 6 }}>{`${m.wins}勝・${d.group.crop_year}年生まれ世代`}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 30, gap: 6 }}>
        {rows.length === 0 && <div style={{ display: "flex", fontSize: 30, color: C.muted }}>まだ指名馬がいません</div>}
        {rows.map((h, i) => {
          const horse = d.horseMap.get(h.horse_id);
          return (
            <div key={h.horse_id} style={{ display: "flex", alignItems: "center", background: i % 2 ? "transparent" : C.row, borderRadius: 6, padding: "0 14px", flex: 1, minHeight: 0, maxHeight: 90 }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: big ? 30 : 25, fontWeight: 900, lineHeight: 1.25 }}>{cut(horse?.name ?? h.horse_id, 12)}</div>
                {big && horse?.sire && <div style={{ display: "flex", fontSize: 17, color: C.muted, lineHeight: 1.25 }}>{cut(`父${horse.sire}${horse.dam ? `・母${horse.dam}` : ""}`, 26)}</div>}
              </div>
              <div style={{ display: "flex", fontSize: 20, color: C.muted, width: 110, justifyContent: "flex-end" }}>{h.starts ? `${h.starts}戦${h.wins}勝` : "未出走"}</div>
              <div style={{ display: "flex", fontSize: big ? 30 : 25, fontWeight: 900, width: 150, justifyContent: "flex-end", color: h.points > 0 ? C.gold : C.muted }}>{h.points > 0 ? `${man(h.points)}万` : "-"}</div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

function RankingImage({ d }: { d: ShareData }) {
  const rows = d.standings.slice(0, 8);
  const big = rows.length <= 6;
  return (
    <Frame label="順位表" title={d.group.name} note={d.standings.length > rows.length ? `上位${rows.length}人（全${d.standings.length}人）` : undefined}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 6 }}>
        {rows.map((s, i) => {
          const top = [...s.horses].sort((a, b) => b.points - a.points)[0];
          const topName = top && top.points > 0 ? d.horseMap.get(top.horse_id)?.name : null;
          return (
            <div key={s.user_id} style={{ display: "flex", alignItems: "center", background: i % 2 ? "transparent" : C.row, borderRadius: 6, padding: "0 18px", flex: 1, minHeight: 0, maxHeight: 90 }}>
              <div style={{ display: "flex", width: 110, fontSize: big ? 40 : 32, fontWeight: 900, color: rankColor(s.rank) }}>{`${s.rank}位`}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: big ? 34 : 28, fontWeight: 900, lineHeight: 1.25 }}>{cut(d.names.get(s.user_id) ?? "名無し", 12)}</div>
                {big && topName && <div style={{ display: "flex", fontSize: 17, color: C.muted, lineHeight: 1.25 }}>{`稼ぎ頭 ${cut(topName, 14)}`}</div>}
              </div>
              <div style={{ display: "flex", fontSize: 22, color: C.muted, width: 110, justifyContent: "flex-end" }}>{`${s.wins}勝`}</div>
              <div style={{ display: "flex", fontSize: big ? 38 : 30, fontWeight: 900, width: 230, justifyContent: "flex-end", color: C.gold }}>{`${man(s.points)}万円`}</div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

/** 画像に出る文字をまとめる（フォントをその文字だけ取り寄せるため） */
function allText(d: ShareData) {
  const parts = [d.group.name, "指名リスト順位表稼ぎ頭上位全父母未出走ほか名無しまだ指名馬がいませんPOG大会を無料で開ける年生まれ世代", host];
  for (const n of d.names.values()) parts.push(n);
  for (const h of d.horseMap.values()) parts.push(h.name, h.sire ?? "", h.dam ?? "");
  return parts.join("");
}

export async function renderShareImage(d: ShareData) {
  const fonts = await ogFonts(allText(d));
  const el = d.member ? <MemberImage d={d} /> : <RankingImage d={d} />;
  return new ImageResponse(el, {
    width: 1200,
    height: 630,
    fonts,
    headers: { "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
