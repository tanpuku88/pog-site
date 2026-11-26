"use client";
import { useState } from "react";
import { PRESETS, describeRules, pointUnit, type GroupRules, type PresetId } from "@/lib/group-rules";

type Props = {
  picks: number;
  cropYear: number;
  seasonStart: string;
  seasonEnd: string;
  rules: GroupRules;
  /** 大会を作るときは詳しい設定を閉じておく */
  collapsed?: boolean;
};

const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } as const;
const check = { display: "flex", gap: 8, alignItems: "center" } as const;
const small = { width: "6em" } as const;

/** ルールの入力欄（3択のプリセット＋詳しく設定）。大会作成と設定画面で共通 */
export default function RulesFields(p: Props) {
  const [preset, setPreset] = useState<PresetId>(p.rules.preset);
  const [picks, setPicks] = useState(p.picks);
  const [cropYear, setCropYear] = useState(p.cropYear);
  const [start, setStart] = useState(p.seasonStart);
  const [end, setEnd] = useState(p.seasonEnd);
  const [r, setR] = useState<GroupRules>(p.rules);

  const choose = (id: PresetId) => {
    const ps = PRESETS.find((x) => x.id === id);
    if (!ps) return;
    setPreset(id);
    setPicks(ps.picks);
    setR(ps.rules);
  };
  // 詳しい設定を触ったら「カスタム」にする
  const edit = (patch: Partial<GroupRules>) => { setPreset("custom"); setR((x) => ({ ...x, ...patch })); };
  const split = r.male !== null;
  const male = r.male ?? Math.ceil(picks / 2);
  const setPicksAndSplit = (n: number) => {
    setPreset("custom");
    setPicks(n);
    if (r.male !== null) setR((x) => ({ ...x, male: Math.min(x.male ?? 0, n), female: n - Math.min(x.male ?? 0, n) }));
  };
  const unit = pointUnit(r);
  const summary = describeRules({ picks_per_member: picks, crop_year: cropYear, season_start: start, season_end: end }, { ...r, male: split ? male : null, female: split ? picks - male : null });

  return (
    <>
      <input type="hidden" name="preset" value={preset} />
      <label>ルールを選ぶ</label>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", margin: "4px 0 8px" }}>
        {PRESETS.map((ps) => {
          const on = preset === ps.id;
          return (
            <button
              type="button" key={ps.id} onClick={() => choose(ps.id)} aria-pressed={on}
              className="secondary"
              style={{ textAlign: "left", padding: 12, whiteSpace: "normal", height: "auto", border: on ? "2px solid var(--accent)" : "1px solid var(--line, #ddd)", background: on ? "var(--th)" : undefined }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>{on ? "✓ " : ""}{ps.name}{ps.id === "standard" && <span className="pill" style={{ marginLeft: 6 }}>おすすめ</span>}</strong>
              <span className="muted" style={{ fontSize: 12 }}>{ps.catch}</span>
            </button>
          );
        })}
      </div>
      {preset === "custom" && <p className="muted" style={{ margin: "0 0 8px" }}>詳しい設定を変えたので「カスタム」になっています。</p>}

      <details open={!p.collapsed} style={{ margin: "8px 0" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>詳しく設定する</summary>

        <label htmlFor="picks">1人あたりの指名頭数</label>
        <input id="picks" name="picks_per_member" type="number" min={1} max={50} value={picks} onChange={(e) => setPicksAndSplit(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />

        <label style={check}>
          <input type="checkbox" name="sex_split" checked={split} style={{ width: "auto" }}
            onChange={(e) => edit(e.target.checked ? { male: Math.ceil(picks / 2), female: picks - Math.ceil(picks / 2) } : { male: null, female: null })} />
          牡馬・牝馬の頭数を決める
        </label>
        {split && (
          <div style={row}>
            牡馬 <input name="male" type="number" min={0} max={picks} value={male} style={small}
              onChange={(e) => { const m = Math.max(0, Math.min(picks, Number(e.target.value) || 0)); edit({ male: m, female: picks - m }); }} />
            頭・牝馬 <strong>{picks - male}</strong> 頭 <span className="muted">（セン馬は牡馬に数えます）</span>
          </div>
        )}

        <label htmlFor="crop">対象の世代（生まれ年）</label>
        <input id="crop" name="crop_year" type="number" value={cropYear} onChange={(e) => setCropYear(Number(e.target.value))} />
        <label htmlFor="start">集計開始日</label>
        <input id="start" name="season_start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <label htmlFor="end">集計終了日（初期値は日本ダービー当日）</label>
        <input id="end" name="season_end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />

        <label>ポイントの数え方</label>
        <div style={row}>
          <label style={check}><input type="radio" name="base" value="prize" checked={r.base === "prize"} onChange={() => edit({ base: "prize" })} style={{ width: "auto" }} />本賞金（万円）</label>
          <label style={check}><input type="radio" name="base" value="finish" checked={r.base === "finish"} onChange={() => edit({ base: "finish" })} style={{ width: "auto" }} />着順ポイント</label>
        </div>
        {r.base === "finish" ? (
          <div style={row}>
            {r.finishPoints.map((v, i) => (
              <span key={i}>{i + 1}着 <input name={`fp${i + 1}`} type="number" min={0} max={1000} value={v} style={{ width: "4.5em" }}
                onChange={(e) => edit({ finishPoints: r.finishPoints.map((x, j) => (j === i ? Math.max(0, Number(e.target.value) || 0) : x)) })} /></span>
            ))}
          </div>
        ) : (
          r.finishPoints.map((v, i) => <input key={i} type="hidden" name={`fp${i + 1}`} value={v} />)
        )}

        <label>重賞を勝ったときのボーナス（{unit}）</label>
        <div style={row}>
          {(["G1", "G2", "G3"] as const).map((g) => (
            <span key={g}>{g} +<input name={g.toLowerCase()} type="number" min={0} max={100000} value={r.gradeBonus[g]} style={small}
              onChange={(e) => edit({ gradeBonus: { ...r.gradeBonus, [g]: Math.max(0, Number(e.target.value) || 0) } })} /></span>
          ))}
        </div>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>地方の交流重賞（Jpn1など）も同じ格として数えます。0にするとボーナスなし。</p>

        <label htmlFor="nonjra">地方・海外のレース</label>
        <select id="nonjra" name="non_jra_rate" value={String(r.nonJraRate)} onChange={(e) => edit({ nonJraRate: Number(e.target.value) })}>
          <option value="100">数える（中央と同じ）</option>
          <option value="50">半分（50%）で数える</option>
          <option value="0">数えない（中央だけ）</option>
        </select>

        <label style={check}>
          <input type="checkbox" name="exclude_jump" checked={r.excludeJump} onChange={(e) => edit({ excludeJump: e.target.checked })} style={{ width: "auto" }} />
          障害レースは数えない
        </label>

        <label htmlFor="bestn">順位の決め方</label>
        <div style={row}>
          <select id="bestn" name="best_n" value={r.bestN ? String(r.bestN) : ""} onChange={(e) => edit({ bestN: e.target.value ? Number(e.target.value) : null })}>
            <option value="">全頭の合計</option>
            {Array.from({ length: Math.max(0, picks - 1) }, (_, i) => i + 1).reverse().map((n) => <option key={n} value={n}>上位{n}頭の合計</option>)}
          </select>
        </div>
      </details>

      <div className="card" style={{ background: "var(--th)", margin: "8px 0" }}>
        <strong>このルールの説明</strong>
        <ul style={{ margin: "4px 0 0", paddingLeft: "1.2em" }}>
          {summary.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </div>
    </>
  );
}
