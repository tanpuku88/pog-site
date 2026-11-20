"use client";
import { useTransition } from "react";
import { removePick } from "./actions";

export default function RemoveButton({ groupId, horseId, name }: { groupId: string; horseId: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="danger"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`${name}の指名を取り消しますか？`)) start(() => removePick(groupId, horseId));
      }}
    >
      {pending ? "取消中…" : "取り消す"}
    </button>
  );
}
