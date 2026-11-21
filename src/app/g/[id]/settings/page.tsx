import { requireGroup } from "@/lib/group-data";
import { inviteMessage } from "@/lib/invite";
import { siteOrigin } from "@/lib/site-origin";
import InviteShare from "@/components/InviteShare";
import { updateRules, leaveGroup, resetInvite, deleteGroup } from "./actions";

export default async function Settings({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string; reset?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { group, user } = await requireGroup(id);
  const inviteUrl = `${await siteOrigin()}/join/${group.invite_code}`;
  const isOwner = group.owner_id === user.id;

  return (
    <>
      {sp.created && <p className="ok">グループを作りました。下の招待リンクを参加者に送ってください。</p>}
      {sp.saved && <p className="ok">設定を保存しました。</p>}
      {sp.reset && <p className="ok">招待リンクを作り直しました。前のリンクはもう使えません。</p>}
      <div className="card">
        <strong>招待リンク</strong>
        <p className="muted" style={{ margin: "4px 0 8px" }}>このリンクを送るだけで仲間を呼べます。開いた人は登録（またはログイン）すると、そのまま参加できます。</p>
        <InviteShare url={inviteUrl} message={inviteMessage(group.name, inviteUrl)} />
        {isOwner && (
          <form action={resetInvite.bind(null, id)} style={{ marginTop: 12 }}>
            <button className="secondary" style={{ fontSize: 12 }}>招待リンクを作り直す（前のリンクは使えなくなります）</button>
          </form>
        )}
      </div>

      {isOwner ? (
        <form action={updateRules.bind(null, id)} className="card">
          <strong>ルール</strong>
          <label htmlFor="name">グループ名</label>
          <input id="name" name="name" defaultValue={group.name} maxLength={40} />
          <label htmlFor="picks">1人あたりの指名頭数</label>
          <input id="picks" name="picks_per_member" type="number" min={1} max={50} defaultValue={group.picks_per_member} />
          <label htmlFor="crop">対象の世代（生まれ年）</label>
          <input id="crop" name="crop_year" type="number" defaultValue={group.crop_year} />
          <label htmlFor="start">集計開始日</label>
          <input id="start" name="season_start" type="date" defaultValue={group.season_start} />
          <label htmlFor="end">集計終了日</label>
          <input id="end" name="season_end" type="date" defaultValue={group.season_end} />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="include_non_jra" defaultChecked={group.include_non_jra} style={{ width: "auto" }} />
            地方・海外の賞金もポイントに含める
          </label>
          <p><button>保存する</button></p>
        </form>
      ) : (
        <div className="card muted">ルールの変更はグループを作った人だけができます。</div>
      )}

      {isOwner && (
        <form action={deleteGroup.bind(null, id)} className="card">
          <strong>大会を削除する</strong>
          <p className="muted" style={{ margin: "4px 0 8px" }}>参加者全員の指名もまとめて消え、元に戻せません。</p>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="confirm" required style={{ width: "auto" }} />
            削除してよいことを確認しました
          </label>
          <p><button className="danger">この大会を削除する</button></p>
        </form>
      )}

      {!isOwner && (
        <form action={leaveGroup.bind(null, id)}>
          <button className="danger">このグループから抜ける</button>
        </form>
      )}
    </>
  );
}
