/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { OWNER_SITES, SUPERVISOR } from "@/config/site";

/** 横の欄：監修者の紹介 */
export function SupervisorBox() {
  return (
    <section className="box">
      <h3 className="box-head">監修</h3>
      <Link href="/supervisor" className="sv-mini">
        <img src={SUPERVISOR.avatar} alt="" width={56} height={56} />
        <span>
          <strong>{SUPERVISOR.name}</strong>
          <small>{SUPERVISOR.title}</small>
          <span className="sv-mini-text">{SUPERVISOR.catch}</span>
        </span>
      </Link>
      <Link href="/supervisor" className="box-more">プロフィールを見る ›</Link>
    </section>
  );
}

/** 運営サイトのカード（サムネイル＋アイコン） */
export function OwnerSiteCards({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "os-list os-large" : "os-list"}>
      {OWNER_SITES.map((s) => (
        <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="os-card">
          <img src={s.thumb} alt="" className="os-thumb" loading="lazy" />
          <span className="os-body">
            <img src={s.icon} alt="" className="os-icon" width={32} height={32} />
            <span className="os-text">
              <strong>{s.name}</strong>
              <small>{s.desc}</small>
            </span>
            <span className="os-tag">{s.label} ↗</span>
          </span>
        </a>
      ))}
    </div>
  );
}

/** 横の欄：監修者＋運営サイト */
export function OwnerSide() {
  return (
    <>
      <SupervisorBox />
      <section className="box">
        <h3 className="box-head">{SUPERVISOR.name}の運営サイト</h3>
        <OwnerSiteCards />
      </section>
    </>
  );
}
