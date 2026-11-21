"use client";
import { useState, useTransition } from "react";
import { addPick } from "../picks/actions";

/** 人気馬一覧からそのまま指名するボタン */
export default function QuickPick({ groupId, horseId }: { groupId: string; horseId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  if (msg?.ok) return <span className="ok" style={{ fontSize: 12 }}>指名しました</span>;
  return (
    <>
      <button
        className="secondary"
        style={{ padding: "3px 10px", fontSize: 12 }}
        disabled={pending}
        onClick={() => start(async () => setMsg(await addPick(groupId, horseId)))}
      >
        {pending ? "登録中…" : "指名する"}
      </button>
      {msg && !msg.ok && <div className="error" style={{ fontSize: 12 }}>{msg.message}</div>}
    </>
  );
}
