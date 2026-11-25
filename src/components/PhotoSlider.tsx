"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/asia/types";

/**
 * 競馬場・海外ガイドの写真スライダー。
 * 指でのスワイプ（横スクロール）に加えて、左右の矢印ボタンと下の丸ボタンのクリックで切り替えられる。
 * JavaScript が動かなくても横スクロールで全部の写真を見られる。
 */
export default function PhotoSlider({ photos }: { photos: Photo[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const n = photos.length;

  const slides = () => Array.from(track.current?.children ?? []) as HTMLElement[];

  // いま一番左に来ている写真の番号を調べる
  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth + 2);
    const items = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - items[0].offsetLeft - left);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    // 右端まで来たら最後の写真を選んだことにする
    if (left + el.clientWidth >= el.scrollWidth - 2) best = items.length - 1;
    setIndex(best);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [update]);

  // i 枚目の写真を左端に寄せる（右端より先には行かない）
  const go = (i: number) => {
    const el = track.current;
    const items = slides();
    if (!el || items.length === 0) return;
    const target = Math.max(0, Math.min(items.length - 1, i));
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(max, items[target].offsetLeft - items[0].offsetLeft), behavior: "smooth" });
    setIndex(target);
  };

  // 矢印は「今の位置から写真1枚分」動かす。2枚並ぶパソコンでも必ず動く
  const step = (dir: 1 | -1) => {
    const el = track.current;
    const items = slides();
    if (!el || items.length < 2) return;
    const w = items[1].offsetLeft - items[0].offsetLeft;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  if (n === 0) return null;
  const atEnd = !canScroll || index >= n - 1;
  const atStart = index === 0;

  return (
    <div className={`photo-slider n${Math.min(n, 3)}`} aria-roledescription="carousel" aria-label="写真">
      <div
        className="ps-track"
        ref={track}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
        }}
      >
        {photos.map((ph, i) => (
          <figure key={ph.src} className="asia-photo ps-slide" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="ph-box"><img src={ph.src} alt={ph.alt} loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} /></span>
            <figcaption>
              {ph.alt}
              <span>写真：<a href={ph.page} target="_blank" rel="noopener noreferrer">{ph.credit}</a>（{ph.license}／Wikimedia Commons）</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {canScroll && (
        <>
          <button type="button" className="ps-arrow prev" onClick={() => step(-1)} disabled={atStart} aria-label="前の写真">‹</button>
          <button type="button" className="ps-arrow next" onClick={() => step(1)} disabled={atEnd} aria-label="次の写真">›</button>
          <div className="ps-dots">
            {photos.map((ph, i) => (
              <button key={ph.src} type="button" className={i === index ? "on" : ""} onClick={() => go(i)} aria-label={`${i + 1}枚目の写真`} aria-current={i === index} />
            ))}
            <span className="ps-count">{index + 1} / {n}</span>
          </div>
        </>
      )}
    </div>
  );
}
