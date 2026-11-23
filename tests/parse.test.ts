import { describe, it, expect } from "vitest";
import {
  parseRaceResults, parseHorseProfile, parseHorseSearch, parseRaceList, parseShutuba,
  venueName, parsePrize, parseDate, parsePedigreePage,
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
      race_id: "202605050211", finish: "1", prize_man: 3800, is_jra: true, surface: null, distance: null,
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

describe("血統表の解析", () => {
  it("血統ページ（5代）から父・母・母父を読む", () => {
    // 5代血統表: 父と母のセルは rowspan=16、母父は rowspan=8
    const rows: string[] = [];
    for (let i = 0; i < 32; i++) {
      let tds = "";
      if (i === 0) tds += `<td rowspan="16"><a href="/horse/ped/1/">サングレーザー</a><br>2014 鹿毛</td><td rowspan="8"><a>ディープインパクト</a></td>`;
      if (i === 16) tds += `<td rowspan="16"><a href="/horse/ped/2/">カレンモエ</a><br>2015 鹿毛</td><td rowspan="8"><a>ロードカナロア</a></td>`;
      if (i === 8 || i === 24) tds += `<td rowspan="8"><a>母方</a></td>`;
      tds += `<td><a>先祖${i}</a></td>`;
      rows.push(`<tr>${tds}</tr>`);
    }
    const html = `<table class="blood_table">${rows.join("")}</table>`;
    expect(parsePedigreePage(html)).toEqual({ sire: "サングレーザー", dam: "カレンモエ", damsire: "ロードカナロア" });
  });

  it("血統表がなければ空を返す", () => {
    expect(parsePedigreePage("<html><body>なし</body></html>")).toEqual({ sire: null, dam: null, damsire: null });
  });
});

import { parseFeed } from "../src/lib/feeds";
describe("RSSの解析", () => {
  it("noteのRSSから記事を読む", () => {
    const xml = `<?xml version="1.0"?><rss xmlns:media="http://search.yahoo.com/mrss/"><channel><title>x</title>
      <item><title>2歳馬診断 第1回</title><link>https://note.com/a/n/n1</link><pubDate>Sat, 21 Nov 2026 10:00:00 +0900</pubDate><media:thumbnail>https://img/1.png</media:thumbnail></item>
      <item><title>リンクなし</title></item></channel></rss>`;
    const items = parseFeed(xml, "note");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: "2歳馬診断 第1回", url: "https://note.com/a/n/n1", source: "note", image: "https://img/1.png" });
    expect(items[0].date).toBe("2026-11-21T01:00:00.000Z");
  });
  it("Atomも読める", () => {
    const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>新馬戦回顧</title><link href="https://ex.com/p1"/><updated>2026-11-20T00:00:00Z</updated></entry></feed>`;
    expect(parseFeed(xml, "blog")[0]).toMatchObject({ title: "新馬戦回顧", url: "https://ex.com/p1" });
  });
});

import { parseNarRaceList, venueOfRaceId } from "../src/lib/netkeiba/parse";
import { isShinba } from "../src/lib/netkeiba/sources";

describe("地方競馬", () => {
  it("レース一覧から地方の race_id を集め、ばんえいと中央は除く", () => {
    const html = `<a href="../race/shutuba.html?race_id=202644112201">1R</a>
      <a href="?race_id=202630112205">門別</a><a href="?race_id=202665112201">帯広</a><a href="?race_id=202605050811">東京</a>`;
    expect(parseNarRaceList(html)).toEqual(["202630112205", "202644112201"]);
  });
  it("競馬場名と新馬戦の判定", () => {
    expect(venueOfRaceId("202644112201")).toBe("大井");
    expect(venueOfRaceId("202605050811")).toBe("東京");
    expect(isShinba("2歳新馬")).toBe(true);
    expect(isShinba("フレッシュチャレンジ")).toBe(true);
    expect(isShinba("2歳未勝利")).toBe(false);
  });
});

import { parseSale, parseClubPrice, parseYenMan } from "../src/lib/netkeiba/parse";
describe("セリ・募集価格", () => {
  it("セリ取引価格を読む", () => {
    expect(parseSale("330万円 (2025年 北海道サマーセール)")).toEqual({ sale_price_man: 330, sale_name: "北海道サマーセール", sale_year: 2025 });
    expect(parseSale("1億5,400万円 (2025年 セレクトセール)")).toMatchObject({ sale_price_man: 15400, sale_name: "セレクトセール" });
    expect(parseSale("-")).toEqual({ sale_price_man: null, sale_name: null, sale_year: null });
  });
  it("募集総額を計算する", () => {
    expect(parseClubPrice("1口:2.2万円/400口")).toBe(880);
    expect(parseClubPrice("1口:5,000円/2,000口")).toBe(1000);
    expect(parseClubPrice("")).toBeNull();
  });
  it("億・万・円", () => {
    expect(parseYenMan("2億円")).toBe(20000);
    expect(parseYenMan("-")).toBeNull();
  });
});

import { parseCourse } from "../src/lib/netkeiba/parse";
describe("馬場と距離", () => {
  it("芝・ダ・障", () => {
    expect(parseCourse("芝1600")).toEqual({ surface: "芝", distance: 1600 });
    expect(parseCourse(" ダ1200 ")).toEqual({ surface: "ダ", distance: 1200 });
    expect(parseCourse("障3000")).toEqual({ surface: "障", distance: 3000 });
    expect(parseCourse("")).toEqual({ surface: null, distance: null });
  });
});

describe("種牡馬の産駒成績", () => {
  it("累計行を読む", async () => {
    const { parseSireOffspring } = await import("../src/lib/netkeiba/parse");
    const html = `<table><tr><th>年度</th><th>順位</th></tr><tr><th>出走</th></tr>
      <tr><td>累計</td><td></td><td>443</td><td>186</td><td>3,334</td><td>404</td><td>279</td><td>32</td><td>749</td><td>91</td><td>2,306</td><td>281</td><td>2,387</td><td>295</td><td>855</td><td>88</td><td>42.0%</td><td>1.91</td><td>1,201,152.4</td><td>1,823.7</td><td>1,697.7</td><td>イクイノックス</td></tr></table>`;
    expect(parseSireOffspring(html)).toMatchObject({ starters: 443, winners: 186, runs: 3334, wins: 404, gradedWins: 32, turfRuns: 2387, turfWins: 295, dirtRuns: 855, dirtWins: 88, winnerRate: 42, ei: 1.91, avgDistTurf: 1824, avgDistDirt: 1698, best: "イクイノックス" });
  });
});

describe("JBIS の種付け料", () => {
  it("金額・条件・繋養先を読む", async () => {
    const { parseJbisFee, parseJbisSearch } = await import("../src/lib/netkeiba/parse");
    const html = `<html><head><title>キタサンブラック｜JBISサーチ（JBIS-Search）</title></head><body>
      <p>戦績 国内：20戦12勝 総賞金 187684.3万円 繋養先 社台スタリオンステーション 勇払郡 安平町 種付料 2026年度：受胎確認後2500万円(フリーリターン特約付) 年度別表彰記録 2016年度</p></body></html>`;
    expect(parseJbisFee(html, "キタサンブラック")).toEqual({ year: 2026, man: 2500, note: "受胎確認後 フリーリターン特約付", farm: "社台スタリオンステーション" });
    expect(parseJbisFee(html, "キタサンフラッグ")).toBeNull();
    expect(parseJbisFee(html.replace(/種付料.*?年度別表彰/, "年度別表彰"), "キタサンブラック")).toBeNull();
    expect(parseJbisSearch(`<a href="/horse/0000228602/">キタサンフラッグ</a><a href="/horse/0001155349/">キタサンブラック</a><a href="/horse/0001155349/pedigree/">p</a>`, "キタサンブラック")).toEqual(["0001155349", "0000228602"]);
    // 外国産馬は JBIS で「(USA)」などが付く
    const usa = html.replace("キタサンブラック｜", "ドレフォン(USA)｜");
    expect(parseJbisFee(usa, "ドレフォン")?.man).toBe(2500);
    expect(parseJbisSearch(`<a href="/horse/1/">x</a><a href="/horse/0001206211/">ドレフォン(USA)</a>`.replace("/horse/1/", "/horse/0000000001/"), "ドレフォン")[0]).toBe("0001206211");
  });
});
