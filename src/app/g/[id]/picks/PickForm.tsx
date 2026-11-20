"use client";
import { useRef, useState, useTransition } from "react";
import {
  searchLocal, searchOnNetkeiba, addPick, addPickByUrl, addPicksBulk,
  type Candidate, type PickResult,
} from "./actions";

type Mode = "search" | "url" | "bulk";

export default function PickForm({ groupId }: { groupId: string }) {
  const [mode, setMode] = useState<Mode>("search");
  const [messages, setMessages] = useState<PickResult[]>([]);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<PickResult | PickResult[]>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setMessages(Array.isArray(r) ? r : [r]);
      after?.();
    });

  return (
    <div>
      <div className="tabs" style={{ marginTop: 8 }}>
        {([["search", "名前で検索"], ["url", "URLを貼る"], ["bulk", "まとめて登録"]] as const).map(([m, label]) => (
          <a key={m} href="#" className={mode === m ? "on" : ""} onClick={(e) => { e.preventDefault(); setMode(m); setMessages([]); }}>{label}</a>
        ))}
      </div>
      {mode === "search" && <SearchPane groupId={groupId} onPick={(id, after) => run(() => addPick(groupId, id), after)} pending={pending} />}
      {mode === "url" && <UrlPane onSubmit={(url) => run(() => addPickByUrl(groupId, url))} pending={pending} />}
      {mode === "bulk" && <BulkPane onSubmit={(text) => run(() => addPicksBulk(groupId, text))} pending={pending} />}
      {pending && <p className="muted">処理中です…（netkeibaから情報を取得するため数秒かかります）</p>}
      {messages.map((m, i) => <p key={i} className={m.ok ? "ok" : "error"} style={{ margin: "4px 0" }}>{m.message}</p>)}
    </div>
  );
}

function SearchPane({ groupId, onPick, pending }: {
  groupId: string;
  onPick: (id: string, after: () => void) => void;
  pending: boolean;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Candidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [remote, startRemote] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef("");

  const search = async (word: string) => {
    latest.current = word;
    const r = await searchLocal(groupId, word);
    if (latest.current === word) {
      setHits(r);
      setSearched(true);
    }
  };

  const onChange = (word: string) => {
    setQ(word);
    clearTimeout(timer.current);
    if (word.trim().length < 2) {
      latest.current = "";
      setHits([]);
      setSearched(false);
      return;
    }
    timer.current = setTimeout(() => search(word), 300);
  };

  return (
    <>
      <label htmlFor="q">馬名・父・母の名前（2文字以上、ひらがなでもOK）</label>
      <input id="q" value={q} onChange={(e) => onChange(e.target.value)} placeholder="例：キタサン、アーモンド" autoComplete="off" />
      <div style={{ marginTop: 8 }}>
        {hits.map((h) => (
          <div className="hit" key={h.id}>
            <div>
              <strong>{h.name}</strong> <span className="muted">{h.sex ?? ""}</span>
              <div className="sub">{[h.sire && `父 ${h.sire}`, h.dam && `母 ${h.dam}`, h.trainer].filter(Boolean).join(" ・ ")}</div>
            </div>
            {h.takenBy
              ? <span className="muted" style={{ whiteSpace: "nowrap" }}>{h.takenBy}が指名済み</span>
              : <button disabled={pending} onClick={() => onPick(h.id, () => search(q))}>指名</button>}
          </div>
        ))}
      </div>
      {searched && (
        <p className="muted">
          {hits.length === 0 ? "見つかりませんでした。" : "探している馬がいない場合は："}
          <button
            className="secondary"
            style={{ marginLeft: 8 }}
            disabled={remote}
            onClick={() => startRemote(async () => setHits(await searchOnNetkeiba(groupId, q)))}
          >
            {remote ? "netkeibaで検索中…" : "netkeibaで探す"}
          </button>
        </p>
      )}
    </>
  );
}

function UrlPane({ onSubmit, pending }: { onSubmit: (url: string) => void; pending: boolean }) {
  const [url, setUrl] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(url); setUrl(""); }}>
      <label htmlFor="url">netkeibaの馬ページのURL</label>
      <div className="row">
        <input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://db.netkeiba.com/horse/2024xxxxxx/" />
        <button disabled={pending || !url}>指名</button>
      </div>
    </form>
  );
}

function BulkPane({ onSubmit, pending }: { onSubmit: (text: string) => void; pending: boolean }) {
  const [text, setText] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(text); }}>
      <label htmlFor="bulk">馬名またはURLを1行に1頭ずつ</label>
      <textarea id="bulk" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={"（馬名）\nhttps://db.netkeiba.com/horse/2024xxxxxx/"} />
      <p><button disabled={pending || !text.trim()}>まとめて指名</button></p>
    </form>
  );
}
