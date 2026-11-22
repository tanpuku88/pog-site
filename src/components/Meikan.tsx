// 名鑑カード：二つ名・能力値・紹介文・POG目線のひとこと
import type { GroupField } from "@/lib/sires";
import { distanceLabel, grade, nickname, profileLines, STAT_LABELS, type Profile, type StatKey } from "@/lib/profile";

const KEYS: StatKey[] = ["early", "consistency", "power", "turf", "dirt"];
const HINT: Record<StatKey, string> = {
  early: "デビューの早さ・夏の勝ち星",
  consistency: "勝ち上がり率",
  power: "1頭あたりの賞金・大物度",
  turf: "芝での勝率",
  dirt: "ダートでの勝率",
};
const EMBLEM: Record<GroupField, string> = { sire: "🐎", trainer: "🏇", owner: "🎩", breeder: "🌾" };

export function Meikan({
  field, label, name, title, profile, avgWinRate, count, written, auto,
}: {
  field: GroupField; label: string; name: string; title: string;
  profile: Profile | null; avgWinRate: number | null; count: number;
  written: { text: string; tags?: string[] } | null; auto: string;
}) {
  const nick = profile ? nickname(field, profile) : null;
  const lines = profile ? profileLines(field, label, profile, avgWinRate) : [];
  const dist = profile ? distanceLabel(profile.distance) : null;
  return (
    <section className="meikan" aria-label={`${title}の名鑑`}>
      <div className="mk-head">
        <span className="mk-emblem" aria-hidden>{EMBLEM[field]}</span>
        <div className="mk-title">
          {nick && <div className="mk-nick">「{nick}」</div>}
          <div className="mk-name">{name}<small>{label}名鑑</small></div>
        </div>
      </div>
      <div className="mk-body">
        <div className="mk-stats">
          {KEYS.map((k) => {
            const v = profile?.scores[k] ?? null;
            const g = grade(v);
            return (
              <div className="mk-row" key={k} title={HINT[k]}>
                <span className="mk-k">{STAT_LABELS[k]}</span>
                <span className="mk-bar"><span className={`mk-fill g-${g}`} style={{ width: `${v ?? 0}%` }} /></span>
                <span className={`mk-g g-${g}`}>{g}</span>
              </div>
            );
          })}
          <div className="mk-chips">
            <span className="mk-chip">勝率 <b>{profile?.winRate != null ? `${profile.winRate.toFixed(1)}%` : "-"}</b></span>
            <span className="mk-chip">得意距離 <b>{dist ?? "-"}</b></span>
          </div>
          <p className="mk-note">能力値は今年の2歳世代での{label}{count > 0 ? `${count}件` : ""}の中の順位（S〜E）。「-」はまだデータが少ない項目です。</p>
        </div>
        <div className="mk-text">
          {written?.tags && <div className="cc-tags">{written.tags.map((t) => <span key={t} className="pill">{t}</span>)}</div>}
          <h3 className="mk-sub">列伝</h3>
          {written && <p>{written.text}</p>}
          {lines.length > 0 && <p>{lines.join("")}</p>}
          {auto && (
            <>
              <h3 className="mk-sub">POG目線のひとこと</h3>
              <p>{auto}</p>
            </>
          )}
          <p className="cc-note">{written ? "最初の文は運営の見立て（2026年11月時点）、ほかは今の数字から毎日自動で書いています。" : "今の数字から毎日自動で書いている文章です。"}</p>
        </div>
      </div>
    </section>
  );
}
