// supabase/migrations の SQL を、Supabase の auth を模した PGlite で実行して、
// 権限（RLS）と指名ルールが意図どおりに働くか確かめる。
import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const C = "00000000-0000-0000-0000-00000000000c";

let db: PGlite;

async function as<T>(uid: string, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role authenticated; select set_config('request.jwt.uid', '${uid}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role;`);
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role authenticated; create role anon;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.uid', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  await db.exec(`
    insert into auth.users (id, email) values ('${A}', 'a@example.com'), ('${B}', 'b@example.com'), ('${C}', 'c@example.com');
    insert into public.horses (id, name, birth_year) values ('h1', '馬1', 2024), ('h2', '馬2', 2024), ('h3', '馬3', 2024);
  `);
});

describe("データベースのルール", () => {
  let gid = "";
  let code = "";

  it("新規ユーザーにプロフィールができる", async () => {
    const r = await db.query<{ display_name: string }>(`select display_name from profiles where id = '${A}'`);
    expect(r.rows[0].display_name).toBe("a");
  });

  it("グループを作ると作成者がメンバーになる", async () => {
    await as(A, async () => {
      const r = await db.query<{ id: string; invite_code: string }>(
        `insert into groups (name, owner_id, crop_year, picks_per_member, season_start, season_end)
         values ('テスト', '${A}', 2024, 2, '2026-06-01', '2027-05-30') returning id, invite_code`);
      gid = r.rows[0].id;
      code = r.rows[0].invite_code;
    });
    expect(code).toHaveLength(12);
    const m = await db.query(`select * from group_members where group_id = '${gid}'`);
    expect(m.rows).toHaveLength(1);
  });

  it("メンバー以外はグループを見られず、指名もできない", async () => {
    await as(B, async () => {
      const r = await db.query(`select * from groups where id = '${gid}'`);
      expect(r.rows).toHaveLength(0);
      await expect(db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${B}', 'h1')`)).rejects.toThrow();
    });
  });

  it("招待コードで参加できる", async () => {
    await as(B, async () => {
      const r = await db.query<{ join_group: string }>(`select join_group('${code}')`);
      expect(r.rows[0].join_group).toBe(gid);
      const g = await db.query(`select * from groups where id = '${gid}'`);
      expect(g.rows).toHaveLength(1);
    });
  });

  it("間違った招待コードでは参加できない", async () => {
    await as(C, async () => {
      await expect(db.query(`select join_group('wrong')`)).rejects.toThrow(/招待リンク/);
    });
  });

  it("同じ馬は1人しか指名できない", async () => {
    await as(A, () => db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${A}', 'h1')`));
    await as(B, async () => {
      await expect(db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${B}', 'h1')`)).rejects.toThrow(/duplicate|unique/);
    });
  });

  it("他人の名義では指名できない", async () => {
    await as(B, async () => {
      await expect(db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${A}', 'h2')`)).rejects.toThrow();
    });
  });

  it("指名頭数の上限を超えられない", async () => {
    await as(A, async () => {
      await db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${A}', 'h2')`);
      await expect(db.query(`insert into picks (group_id, user_id, horse_id) values ('${gid}', '${A}', 'h3')`)).rejects.toThrow(/2頭まで/);
    });
  });

  it("他人の指名は取り消せない", async () => {
    await as(B, () => db.query(`delete from picks where group_id = '${gid}' and horse_id = 'h1'`));
    const r = await db.query(`select * from picks where horse_id = 'h1'`);
    expect(r.rows).toHaveLength(1);
  });

  it("ルール変更はオーナーだけ", async () => {
    await as(B, () => db.query(`update groups set picks_per_member = 99 where id = '${gid}'`));
    const r = await db.query<{ picks_per_member: number }>(`select picks_per_member from groups where id = '${gid}'`);
    expect(r.rows[0].picks_per_member).toBe(2);
  });

  it("ログインしていない人は馬と成績を読めるが、書き込めない", async () => {
    await db.exec(`set role anon;`);
    try {
      await expect(db.query(`insert into horses (id, name) values ('x', 'x')`)).rejects.toThrow();
    } finally {
      await db.exec(`reset role;`);
    }
  });
});
