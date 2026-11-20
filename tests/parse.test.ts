import { describe, it, expect } from "vitest";
import {
  parseRaceResults, parseHorseProfile, parseHorseSearch, parseRaceList, parseShutuba,
  venueName, parsePrize, parseDate,
} from "../src/lib/netkeiba/parse";
import { extractHorseId, encodeEucJp } from "../src/lib/netkeiba/fetch";

// netkeiba の馬ページを模した最小限のHTML
const horsePage = `
<div class="horse_title"><h1>テストホース </h1><p class="txt_01">現役　牡2歳　鹿毛</p></div>
<table class="db_prof_table">
  <tr><th>生年月日</th><td>2024年3月1日</td></tr>
  <tr><th>調教師</th><td><a>山田太郎 (美浦)</a></td></tr>
  <tr><th>馬主</th><td>テスト馬主</td></tr>
  <tr><th>生産者</th><td>テスト牧場</td></tr>
</table>
<table class="blood_table">
  <tr><td rowspan="2"><a href="/horse/ped/x/">キタサンブラック</a></td><td>ブラックタイド</td></tr>
  <tr><td>シュガーハート</td></tr>
  <tr><td rowspan="2"><a>テストマザー</a></td><td><a>ディープインパクト</a></td></tr>
  <tr><td>テストグランマ</td></tr>
</table>
<table class="db_h_race_results nk_tb_common">
  <thead><tr><th>日付</th><th>開催</th><th>天気</th><th>R</th><th>レース名</th><th>頭数</th><th>着順</th><th>騎手</th><th>賞 金</th></tr></thead>
  <tbody>
    <tr><td><a>2026/11/08</a></td><td><a>5東京2</a></td><td>晴</td><td>11</td><td><a href="/race/202605050211/">京王杯2歳S(G2)</a></td><td>12</td><td>1</td><td>騎手A</td><td>3,800.0</td></tr>
    <tr><td><a>2026/10/01</a></td><td><a>大井</a></td><td>曇</td><td>9</td><td><a href="/race/202644100109/">地方特別</a></td><td>10</td><td>2</td><td>騎手B</td><td>200.0</td></tr>
    <tr><td><a>2026/07/20</a></td><td><a>2新潟4</a></td><td>晴</td><td>5</td><td><a href="/race/202604020405/">2歳新馬</a></td><td>16</td><td>1</td><td>騎手A</td><td>750.0</td></tr>
    <tr><td><a>2026/06/30</a></td><td><a>1福島1</a></td><td>雨</td><td>5</td><td><a>2歳未勝利</a></td><td>16</td><td>中止</td><td>騎手A</td><td></td></tr>
  </tbody>
</table>`;

describe("馬ページの解析", () => {
  it("プロフィールと血統を読める", () => {
    const p = parseHorseProfile("2024100001", horsePage)!;
    expect(p).toMatchObject({
      id: "2024100001", name: "テストホース", sex: "牡", birth_year: 2024,
      sire: "キタサンブラック", dam: "テストマザー", damsire: "ディープインパクト",
      trainer: "山田太郎 (美浦)", owner: "テスト馬主", breeder: "テスト牧場",
    });
  });

  it("成績表を読み、JRAかどうかを判定する", () => {
    const r = parseRaceResults(horsePage)!;
    expect(r).toHaveLength(4);
    expect(r[0]).toEqual({
      race_date: "2026-11-08", venue: "東京", race_name: "京王杯2歳S(G2)",
      race_id: "202605050211", finish: "1", prize_man: 3800, is_jra: true,
    });
    expect(r[1]).toMatchObject({ venue: "大井", is_jra: false, prize_man: 200 });
    expect(r[3]).toMatchObject({ finish: "中止", prize_man: 0 });
  });

  it("成績表がないページでは null を返す", () => {
    expect(parseRaceResults("<html><body>なし</body></html>")).toBeNull();
  });

  it("馬名がないページでは null を返す", () => {
    expect(parseHorseProfile("x", "<html></html>")).toBeNull();
  });
});

describe("馬名検索の解析", () => {
  const html = `<table class="nk_tb_common race_table_01">
    <tr><th>馬名</th><th>性</th><th>生年</th><th>厩舎</th><th>父</th><th>母</th><th>母父</th><th>馬主</th><th>生産者</th><th>総賞金(万円)</th></tr>
    <tr><td><a href="/horse/2024100001/">テストホース</a></td><td>牡</td><td>2024</td><td>[東] 山田</td><td>キタサンブラック</td><td>テストマザー</td><td>ディープインパクト</td><td>x</td><td>y</td><td>4,750</td></tr>
    <tr><td><a href="/horse/2023100002/">オトナホース</a></td><td>牝</td><td>2023</td><td>[西] 佐藤</td><td>エピファネイア</td><td>ママ</td><td>パパ</td><td>x</td><td>y</td><td>0</td></tr>
  </table>`;
  it("馬ID・世代・父母を読める", () => {
    const hits = parseHorseSearch(html);
    expect(hits).toHaveLength(2);
    expect(hits[0]).toEqual({
      id: "2024100001", name: "テストホース", sex: "牡", birth_year: 2024,
      sire: "キタサンブラック", dam: "テストマザー", damsire: "ディープインパクト", trainer: "[東] 山田",
    });
    expect(hits[1].birth_year).toBe(2023);
  });
});

describe("出馬表の解析", () => {
  it("レース一覧からJRAのrace_idだけ集める", () => {
    const html = `<a href="../race/shutuba.html?race_id=202605050211&rf=race_list">x</a>
      <a href="../race/result.html?race_id=202605050211">dup</a>
      <a href="?race_id=202609050501">阪神</a><a href="?race_id=202644100109">大井</a>`;
    expect(parseRaceList(html)).toEqual(["202605050211", "202609050501"]);
  });

  it("出馬表から馬IDと発走時刻を読む", () => {
    const html = `<div class="RaceName">京王杯2歳S</div><div class="RaceData01">15:25発走 / 芝1400m</div>
      <table class="Shutuba_Table"><tr><td><a href="https://db.netkeiba.com/horse/2024100001">A</a></td></tr>
      <tr><td><a href="https://db.netkeiba.com/horse/2024100002/">B</a></td></tr></table>`;
    expect(parseShutuba("202605050211", html)).toEqual({
      race_id: "202605050211", race_name: "京王杯2歳S", venue: "東京", race_no: 11,
      post_time: "15:25", horse_ids: ["2024100001", "2024100002"],
    });
  });
});

describe("小さな変換", () => {
  it("開催名から競馬場名を取り出す", () => {
    expect(venueName("5東京2")).toBe("東京");
    expect(venueName("ロンシャン")).toBe("ロンシャン");
  });
  it("賞金と日付", () => {
    expect(parsePrize("1,450.0")).toBe(1450);
    expect(parsePrize("")).toBe(0);
    expect(parsePrize("-")).toBe(0);
    expect(parseDate("2026/7/5")).toBe("2026-07-05");
  });
  it("URLから馬IDを取り出す", () => {
    expect(extractHorseId("https://db.netkeiba.com/horse/2024100001/")).toBe("2024100001");
    expect(extractHorseId("https://db.netkeiba.com/horse/result/2024100001/")).toBe("2024100001");
    expect(extractHorseId("https://sp.netkeiba.com/horse/2024100001")).toBe("2024100001");
    expect(extractHorseId("2024100001")).toBe("2024100001");
    expect(extractHorseId("キタサン")).toBeNull();
  });
  it("EUC-JPでエンコードする", () => {
    expect(encodeEucJp("あ")).toBe("%A4%A2");
    expect(encodeEucJp("A1")).toBe("A1");
  });
});
