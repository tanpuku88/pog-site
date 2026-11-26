import { requireGroup } from "@/lib/group-data";
import { inviteMessage } from "@/lib/invite";
import { siteOrigin } from "@/lib/site-origin";
import InviteShare from "@/components/InviteShare";
import { updateRules, leaveGroup, resetInvite, deleteGroup } from "./actions";
import RulesFields from "@/components/RulesFields";
import { rulesOf } from "@/lib/group-rules";

export default async function Settings({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string; reset?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { group, user, supabase } = await requireGroup(id);
  const { count: pickCount } = await supabase.from("picks").select("horse_id", { count: "exact", head: true }).eq("group_id", id);
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
          <RulesFields picks={group.picks_per_member} cropYear={group.crop_year} seasonStart={group.season_start} seasonEnd={group.season_end} rules={rulesOf(group)} collapsed={!!group.rules} />
          {(pickCount ?? 0) > 0 && <p className="muted">すでに{pickCount}頭が指名されています。ルールを変えると、順位はすぐに新しいルールで計算し直されます。牡馬・牝馬の頭数の変更は、これからの指名にだけ効きます。</p>}
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
