// アジア競馬ガイド用のオリジナルイラスト（すべてこのサイトで描いたSVG。外部の絵や写真は使っていない）
import type { Food, Track } from "@/content/asia/types";

function Horse({ x, y, s = 1, coat = "#3b2516", silk = "#c0291f", cap = "#fff" }: { x: number; y: number; s?: number; coat?: string; silk?: string; cap?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-21 -3 Q -34 -8 -40 4" stroke={coat} strokeWidth="4" fill="none" strokeLinecap="round" />
      <g stroke={coat} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="15,5 28,14 35,12" />
        <polyline points="10,7 17,19 22,22" />
        <polyline points="-15,5 -29,12 -35,10" />
        <polyline points="-11,7 -9,19 -4,23" />
      </g>
      <ellipse cx="0" cy="0" rx="22" ry="9" fill={coat} />
      <polygon points="12,-5 25,-22 32,-19 23,3" fill={coat} />
      <polygon points="25,-23 41,-16 39,-11 28,-13" fill={coat} />
      <polygon points="26,-24 27,-30 30,-23" fill={coat} />
      <polygon points="-3,-8 8,-18 13,-12 3,-5" fill={silk} />
      <circle cx="10" cy="-21" r="4" fill={cap} />
      <line x1="9" y1="-13" x2="20" y2="-14" stroke={silk} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** ページ上部の大きな絵：夕方の競馬場を駆ける3頭 */
export function RaceHero({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 300" role="img" aria-label="山並みを背に競馬場を走る3頭の馬のイラスト" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2b5c" />
          <stop offset=".55" stopColor="#c8546b" />
          <stop offset="1" stopColor="#f6b36b" />
        </linearGradient>
        <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9935a" />
          <stop offset="1" stopColor="#9c6a3a" />
        </linearGradient>
      </defs>
      <rect width="640" height="300" fill="url(#sky)" />
      <circle cx="500" cy="120" r="34" fill="#ffd98a" opacity=".9" />
      {/* 山並み（韓国の山がちな景色をイメージ） */}
      <path d="M0 175 L60 130 L110 155 L170 105 L230 150 L290 120 L350 160 L420 112 L480 150 L540 125 L600 160 L640 140 L640 200 L0 200Z" fill="#3a2f55" opacity=".85" />
      <path d="M0 190 L80 160 L150 182 L230 150 L320 185 L400 158 L490 186 L580 162 L640 180 L640 210 L0 210Z" fill="#2a2446" />
      {/* スタンド */}
      <g fill="#1b1a33">
        <rect x="40" y="168" width="230" height="34" />
        <polygon points="30,168 280,168 262,152 48,152" fill="#24224a" />
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={50 + i * 20} y="176" width="12" height="8" fill="#ffd98a" opacity=".55" />
        ))}
      </g>
      {/* 芝の帯と砂のコース */}
      <rect y="202" width="640" height="16" fill="#2f6b3f" />
      <rect y="218" width="640" height="82" fill="url(#dirt)" />
      {Array.from({ length: 17 }).map((_, i) => (
        <g key={i}>
          <rect x={i * 40} y="210" width="3" height="16" fill="#fff" />
        </g>
      ))}
      <rect y="210" width="640" height="3" fill="#fff" />
      <g opacity=".25" stroke="#6e4524" strokeWidth="2">
        <line x1="0" y1="250" x2="640" y2="246" />
        <line x1="0" y1="278" x2="640" y2="272" />
      </g>
      <Horse x={170} y={262} s={1.55} coat="#2a1a10" silk="#2b62c4" cap="#ffd400" />
      <Horse x={330} y={252} s={1.7} coat="#5a3520" silk="#c0291f" cap="#ffffff" />
      <Horse x={470} y={268} s={1.6} coat="#8a8a8a" silk="#17703c" cap="#ffffff" />
    </svg>
  );
}

/** 競馬場の位置（形はイメージ） */
export function TrackMap({ tracks }: { tracks: Track[] }) {
  return (
    <svg viewBox="0 0 100 132" className="asia-map" role="img" aria-label="韓国の競馬場の位置を示す地図（イメージ）">
      <path
        d="M30 16 L46 12 L58 15 L70 22 L78 34 L82 48 L85 62 L86 76 L83 90 L76 99 L64 102 L52 103 L40 105 L30 101 L23 92 L26 82 L20 72 L23 60 L19 50 L25 40 L23 30Z"
        fill="var(--accent-weak)" stroke="var(--accent)" strokeWidth="1"
      />
      <ellipse cx="31" cy="121" rx="10" ry="4.5" fill="var(--accent-weak)" stroke="var(--accent)" strokeWidth="1" />
      {tracks.map((t) => (
        <g key={t.name}>
          <circle cx={t.pos.x} cy={t.pos.y} r="3.6" fill={t.color} stroke="#fff" strokeWidth="1" />
          <text x={t.pos.y > 110 ? t.pos.x + 14 : t.pos.x + (t.pos.x > 60 ? -5 : 5)} y={t.pos.y + 1.4} fontSize="5" fontWeight="700" fill="var(--text)" textAnchor={t.pos.y <= 110 && t.pos.x > 60 ? "end" : "start"}>
            {t.name.replace("レッツランパーク ", "").replace(/（.*/, "")}
          </text>
        </g>
      ))}
      <text x="96" y="6" fontSize="3.6" fill="var(--muted)" textAnchor="end">※位置はイメージ</text>
    </svg>
  );
}

/** 食べもののアイコン */
export function FoodIcon({ kind }: { kind: Food["icon"] }) {
  const bowl = <path d="M6 24 H42 Q40 40 24 40 Q8 40 6 24Z" fill="#e9e1d3" stroke="#8a6b4a" strokeWidth="1.6" />;
  return (
    <svg viewBox="0 0 48 48" className="food-icon" aria-hidden>
      <circle cx="24" cy="24" r="23" fill="var(--gold-weak)" />
      {kind === "soup" && (<>
        {bowl}
        <path d="M8 24 Q24 18 40 24" fill="#d9a066" />
        <path d="M18 18 q-3 -5 0 -9 M24 17 q-3 -5 0 -9 M30 18 q-3 -5 0 -9" stroke="#b9a89a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>)}
      {kind === "noodle" && (<>
        {bowl}
        <path d="M10 24 q4 -6 8 0 q4 -6 8 0 q4 -6 8 0 q3 -5 6 0" stroke="#f1d27a" strokeWidth="2" fill="none" />
        <circle cx="30" cy="20" r="3" fill="#c0291f" />
        <line x1="14" y1="8" x2="30" y2="22" stroke="#6b4a2a" strokeWidth="1.6" />
        <line x1="18" y1="7" x2="32" y2="21" stroke="#6b4a2a" strokeWidth="1.6" />
      </>)}
      {kind === "bbq" && (<>
        <ellipse cx="24" cy="30" rx="17" ry="7" fill="#3a3a3a" />
        <g stroke="#777" strokeWidth="1"><line x1="10" y1="30" x2="38" y2="30" /><line x1="13" y1="27" x2="35" y2="27" /><line x1="13" y1="33" x2="35" y2="33" /></g>
        <rect x="13" y="23" width="10" height="5" rx="1.5" fill="#e7a58a" stroke="#b5653e" />
        <rect x="25" y="24" width="10" height="5" rx="1.5" fill="#d58a6c" stroke="#a0522d" />
        <path d="M18 18 q-2 -4 1 -7 M28 18 q-2 -4 1 -7" stroke="#bbb" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>)}
      {kind === "street" && (<>
        <circle cx="24" cy="28" r="13" fill="#d9a84f" stroke="#a5742a" strokeWidth="1.5" />
        <circle cx="19" cy="25" r="2" fill="#5f8f3a" /><circle cx="28" cy="31" r="2" fill="#c0291f" /><circle cx="27" cy="23" r="1.6" fill="#5f8f3a" />
        <rect x="31" y="9" width="7" height="13" rx="2" fill="#f5f0e6" stroke="#9a8d7a" />
      </>)}
      {kind === "fish" && (<>
        <path d="M8 26 Q20 14 34 24 L42 18 L40 26 L42 34 L34 28 Q20 38 8 26Z" fill="#b8c7d6" stroke="#5c7389" strokeWidth="1.4" />
        <circle cx="14" cy="24" r="1.6" fill="#1a1f1c" />
      </>)}
      {kind === "rice" && (<>
        {bowl}
        <circle cx="24" cy="22" r="9" fill="#fff" />
      </>)}
    </svg>
  );
}
