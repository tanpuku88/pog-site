"use client";
import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/** 招待リンクのコピー・LINE・X・スマホの共有ボタン */
export default function InviteShare({ url, message }: { url: string; message: string }) {
  const [copied, setCopied] = useState(false);
  // スマホの「共有」ボタンが使えるか（サーバーでは false にして表示のずれを防ぐ）
  const canShare = useSyncExternalStore(noop, () => "share" in navigator, () => false);
  const text = message.replace(url, "").trim();
  return (
    <>
      <div className="row">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="招待リンク" />
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            try { await navigator.clipboard.writeText(message); } catch { /* 選択してコピーしてもらう */ }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "コピーしました" : "招待文をコピー"}
        </button>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <a className="btn" style={{ background: "#06C755", color: "#fff" }} href={`https://line.me/R/share?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">LINEで送る</a>
        <a className="btn" style={{ background: "#000", color: "#fff" }} href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Xでポスト</a>
        {canShare && (
          <button type="button" className="secondary" onClick={() => navigator.share({ text, url }).catch(() => {})}>ほかのアプリで送る</button>
        )}
      </div>
    </>
  );
}
