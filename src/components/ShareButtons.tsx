"use client";
import { useState, useSyncExternalStore } from "react";
import { xIntentUrl } from "@/lib/share-url";

const noop = () => () => {};

/** シェア画像のプレビューと、X・LINE・画像保存・リンクコピーのボタン */
export default function ShareButtons({ url, imageUrl, text, fileName }: { url: string; imageUrl: string; text: string; fileName: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // スマホで「画像ごと共有」ができるか（サーバーでは false にして表示のずれを防ぐ）
  const canShareFile = useSyncExternalStore(noop, () => "canShare" in navigator, () => false);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  async function shareImage() {
    setBusy(true);
    try {
      const blob = await fetch(imageUrl).then((r) => r.blob());
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text}\n${url}` });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch { /* 共有をやめたときなど */ }
    setBusy(false);
  }

  return (
    <div className="share-box">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="シェア画像のプレビュー" width={1200} height={630} loading="lazy" style={{ width: "100%", maxWidth: 480, height: "auto", borderRadius: 6, display: "block", border: "1px solid var(--line)" }} />
      <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <a className="btn" style={{ background: "#000", color: "#fff" }} href={xIntentUrl(text, url)} target="_blank" rel="noreferrer">Xでポスト</a>
        <a className="btn" style={{ background: "#06C755", color: "#fff" }} href={`https://line.me/R/share?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer">LINEで送る</a>
        <button type="button" className="secondary" disabled={busy} onClick={shareImage}>{canShareFile ? "画像で共有" : "画像を保存"}</button>
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            try { await navigator.clipboard.writeText(url); flash("リンクをコピーしました"); } catch { flash(url); }
          }}
        >
          リンクをコピー
        </button>
      </div>
      {msg && <div className="muted" style={{ marginTop: 6 }}>{msg}</div>}
    </div>
  );
}
