// 名鑑カード：二つ名・能力値・紹介文・POG目線のひとこと
import type { GroupField } from "@/lib/sires";
import { distanceLabel, grade, nickname, profileLines, STAT_LABELS, type Profile, type StatKey } from "@/lib/profile";
import { LORE } from "@/lib/lore";
import { commentKey } from "@/lib/comments";
import { sireStory } from "@/lib/meikan";
import { sireData } from "@/lib/sire-data";

const KEYS: StatKey[] = ["early", "consistency", "power", "turf", "dirt"];
const HINT: Record<StatKey, string> = {
  early: "デビューの早さ・夏の勝ち星",
  consistency: "勝ち上がり率",
  power: "1頭あたりの賞金・大物度",
  turf: "芝での勝率（種牡馬は過去の全産駒）",
  dirt: "ダートでの勝率（種牡馬は過去の全産駒）",
};
const EMBLEM: Record<GroupField, string> = { sire: "🐎", trainer: "🏇", owner: "🎩", breeder: "🌾" };

export function Meikan({
  field, label, name, title, profile, avgWinRate, count, written, auto,
}: {
  field: GroupField; label: string; name: string; title: string;
  profile: Profile | null; avgWinRate: number | null; count: number;
  written: { text: string; tags?: string[] } | null; auto: string;
}) {
  const nick = profile ? profile.nick ?? nickname(field, profile) : (LORE[field][commentKey(name)]?.nick ?? null);
  const lines = profile ? profileLines(field, label, profile, avgWinRate) : [];
  const lore = LORE[field][field === "sire" ? name : commentKey(name)];
  const sd = field === "sire" ? sireData(name) : null;
  const story = field === "sire" ? sireStory(sd, { turf: null, dirt: null, distance: profile?.distance ?? null, source: null }) : null;
  const dist = profile ? distanceLabel(profile.distance) : null;
  return (
    <section className="meikan" aria-label={`${title}の名鑑`}>
      <div className="mk-head">
        <span className="mk-emblem" aria-hidden>{EMBLEM[field]}</span>
        <div className="mk-title">
          {nick && <div className="mk-nick">「{nick}」</div>}
          <div className="mk-name">{name}<small>{label}名鑑</small></div>
        </div>
        {sd?.stud && (
          <div className="mk-fee" title={sd.stud.note ?? undefined}>
            <div className="mk-fee-k">{sd.stud.year ? `${sd.stud.year}年 ` : ""}種付料</div>
            <div className="mk-fee-v">{sd.stud.man !== null ? <>{sd.stud.man.toLocaleString()}<small>万円</small></> : <span className="mk-fee-p">{sd.stud.note ?? "非公開"}</span>}</div>
            {sd.stud.farm && <div className="mk-fee-s">{sd.stud.farm}</div>}
          </div>
        )}
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
          <p className="mk-note">能力値は今年の2歳世代での{label}{count > 0 ? `${count}件` : ""}の中の順位（S〜E）。{field === "sire" && profile?.aptSource === "offspring" ? "芝・ダート・距離は過去の全産駒の成績から。" : field === "sire" && profile?.aptSource === "career" ? "芝・ダート・距離は現役時代の成績から。" : ""}「-」はまだデータが少ない項目です。</p>
        </div>
        <div className="mk-text">
          {written?.tags && <div className="cc-tags">{written.tags.map((t) => <span key={t} className="pill">{t}</span>)}</div>}
          <h3 className="mk-sub">列伝</h3>
          {lore ? <p>{lore.story}</p> : written && <p>{written.text}</p>}
          {story?.career && <p>{story.career}</p>}
          {!lore && !written && !story?.career && <p>今年の2歳世代でどこまで名を上げるか。数字が物語を書き始めたところです。</p>}
          {story && story.traits.length > 0 && (
            <>
              <h3 className="mk-sub">{label === "種牡馬" ? "産駒の特徴" : "特徴"}</h3>
              <p>{story.traits.join("")}</p>
            </>
          )}
          {lines.length > 0 && (
            <>
              <h3 className="mk-sub">今年の2歳{field === "sire" ? "産駒" : ""}の傾向</h3>
              <p>{lines.join("")}</p>
            </>
          )}
          {(auto || (lore && written)) && (
            <>
              <h3 className="mk-sub">POG目線のひとこと</h3>
              {lore && written && <p>{written.text}</p>}
              {auto && <p>{auto}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
