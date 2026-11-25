// JRAの場外発売所（ウインズ／エクセル／ライトウインズ）。
// 正本はJRA公式「ウインズ・エクセル一覧」https://www.jra.go.jp/facilities/wins.html と各施設ページ（2026-11-25確認）。
// 競馬場で発売するパークウインズと、地方主催者がJRAを売るJ-PLACEは対象外。
import type { Facility } from "./types";

const OP = "JRA（日本中央競馬会）";

export const JRA_FACILITIES: Facility[] = [
  { slug: "wins-kushiro", name: "ウインズ釧路", org: "JRA", kind: "ウインズ", pref: "北海道", region: "北海道", address: "北海道釧路郡釧路町中央2-5", operator: OP, paidSeat: null, access: "JR釧路駅から車約15分" },
  { slug: "wins-sapporo", name: "ウインズ札幌", org: "JRA", kind: "ウインズ", pref: "北海道", region: "北海道", address: "北海道札幌市中央区南3条西4-3", operator: OP, paidSeat: null, access: "地下鉄・すすきの駅から徒歩2分", note: "すすきのの街なかウインズ。" },
  { slug: "wins-tsugaru", name: "ウインズ津軽", org: "JRA", kind: "ウインズ", pref: "青森県", region: "東北", address: "青森県南津軽郡田舎館村大字高樋字大曲7-1", operator: OP, paidSeat: null, access: "弘南鉄道・田んぼアート駅から徒歩約5分", note: "田んぼアートの村のウインズ。中に岩手競馬の発売所もあり、地方競馬も買える。" },
  { slug: "wins-yokote", name: "ウインズ横手", org: "JRA", kind: "ウインズ", pref: "秋田県", region: "東北", address: "秋田県横手市安田字向田201（テレトラック横手内）", operator: OP, paidSeat: null, access: "JR横手駅からタクシー約10分", note: "地方のテレトラック横手と同居するウインズ。" },
  { slug: "wins-shinshirakawa", name: "ウインズ新白河", org: "JRA", kind: "ウインズ", pref: "福島県", region: "東北", address: "福島県西白河郡西郷村大字小田倉字前山50番地", operator: OP, paidSeat: null, access: "JR新白河駅から徒歩約5分" },
  { slug: "excel-ibaraki-sakai", name: "エクセル茨城境", org: "JRA", kind: "エクセル", pref: "茨城県", region: "関東", address: "茨城県猿島郡境町1327-1 MGMパワーセンター2階", operator: OP, paidSeat: null, note: "全席指定のエクセル。最寄りの鉄道駅はなく車主体。" },
  { slug: "light-wins-ami", name: "ライトウインズ阿見", org: "JRA", kind: "ライトウインズ", pref: "茨城県", region: "関東", address: "茨城県稲敷郡阿見町よしわら1丁目1番地4号", operator: OP, paidSeat: null, note: "小型のライトウインズ。圏央道・阿見東ICのすぐそば。" },
  { slug: "wins-urawa", name: "ウインズ浦和", org: "JRA", kind: "ウインズ", pref: "埼玉県", region: "関東", address: "埼玉県さいたま市南区大谷場1-8-42（浦和競馬場内）", operator: OP, paidSeat: null, access: "JR南浦和駅・浦和駅から各徒歩15分（無料送迎バスあり）", note: "地方の浦和競馬場の中にあるウインズ。" },
  { slug: "wins-kinshicho", name: "ウインズ錦糸町", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都墨田区江東橋3-8-2（東館）／江東橋2-11-7（西館）", operator: OP, paidSeat: null, access: "JR・半蔵門線 錦糸町駅から徒歩3分" },
  { slug: "wins-asakusa", name: "ウインズ浅草", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都台東区浅草2-8-6", operator: OP, paidSeat: null, access: "つくばエクスプレス浅草駅から徒歩約1分", note: "浅草寺・仲見世のすぐそば。観光と競馬が同居する下町のウインズ。" },
  { slug: "wins-korakuen", name: "ウインズ後楽園", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都文京区後楽1-3-61", operator: OP, paidSeat: null, access: "JR水道橋駅西口から徒歩約1分", note: "同じビルに南関のオフト後楽園も入る、都心の場外ビル。" },
  { slug: "wins-ginza", name: "ウインズ銀座", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都中央区銀座2-10-13", operator: OP, paidSeat: null, access: "銀座駅A13出口から徒歩約3分", note: "かつてのウインズ銀座通り（2013年閉鎖）とは別の、現在の銀座のウインズ。" },
  { slug: "wins-shiodome", name: "ウインズ汐留", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都港区東新橋2-18-1", operator: OP, paidSeat: null, access: "汐留駅から徒歩約3分", note: "7階に南関のオフト汐留が入る。" },
  { slug: "wins-shinjuku", name: "ウインズ新宿", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都新宿区新宿4-2-11", operator: OP, paidSeat: null, access: "JR新宿駅東南口から徒歩3分" },
  { slug: "wins-shibuya", name: "ウインズ渋谷", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都渋谷区渋谷3-12-10", operator: OP, paidSeat: null, access: "JR渋谷駅新南改札から徒歩約6分", note: "改築のため2026年末で営業休止、2027年1月〜2031年秋頃まで閉鎖予定（JRA発表）。" },
  { slug: "excel-tanashi", name: "エクセル田無", org: "JRA", kind: "エクセル", pref: "東京都", region: "関東", address: "東京都西東京市田無町2-1-1 ASTAビル内 リヴィン田無店6階", operator: OP, paidSeat: null, access: "西武新宿線・田無駅北口から徒歩約1分", note: "UMACA専用（紙の馬券の発売・払戻なし）。2026年末で営業終了の告知あり。" },
  { slug: "wins-tachikawa", name: "ウインズ立川", org: "JRA", kind: "ウインズ", pref: "東京都", region: "関東", address: "東京都立川市錦町1-3-6（A館）／錦町1-3-18（B館）", operator: OP, paidSeat: null, access: "JR立川駅南口から徒歩約3分" },
  { slug: "wins-shinyokohama", name: "ウインズ新横浜", org: "JRA", kind: "ウインズ", pref: "神奈川県", region: "関東", address: "神奈川県横浜市港北区新横浜2-15-7", operator: OP, paidSeat: null, access: "新横浜駅から徒歩2〜5分" },
  { slug: "wins-yokohama", name: "ウインズ横浜", org: "JRA", kind: "ウインズ", pref: "神奈川県", region: "関東", address: "神奈川県横浜市中区宮川町3-70", operator: OP, paidSeat: null, access: "京急・日ノ出町駅から徒歩約3分／桜木町駅から徒歩約4分", note: "野毛の飲み屋街のそば。下町情緒のあるウインズ。" },
  { slug: "excel-isezaki", name: "エクセル伊勢佐木", org: "JRA", kind: "エクセル", pref: "神奈川県", region: "関東", address: "神奈川県横浜市中区伊勢佐木町1-7-1", operator: OP, paidSeat: null, access: "関内駅から徒歩約5分" },
  { slug: "wins-isawa", name: "ウインズ石和", org: "JRA", kind: "ウインズ", pref: "山梨県", region: "北陸・東海", address: "山梨県笛吹市石和町窪中島1017-1", operator: OP, paidSeat: null, access: "JR石和温泉駅から徒歩約20分", note: "温泉地・石和のウインズ。湯上がり競馬という手もある。" },
  { slug: "excel-hamamatsu", name: "エクセル浜松", org: "JRA", kind: "エクセル", pref: "静岡県", region: "北陸・東海", address: "静岡県浜松市中央区鍛冶町1-2 かじ町プラザ4階", operator: OP, paidSeat: null, access: "JR浜松駅北口から徒歩3分", note: "かつて同じ浜松にあった川崎競馬のジョイホース浜松は2023年に閉鎖。いま浜松の場外はここ。" },
  { slug: "wins-nagoya", name: "ウインズ名古屋", org: "JRA", kind: "ウインズ", pref: "愛知県", region: "北陸・東海", address: "愛知県名古屋市中川区尾頭橋1-1-47", operator: OP, paidSeat: null, access: "JR尾頭橋駅から徒歩約5分／金山駅から徒歩約10分" },
  { slug: "wins-kyoto", name: "ウインズ京都", org: "JRA", kind: "ウインズ", pref: "京都府", region: "関西", address: "京都府京都市東山区大和大路通り四条下ル4丁目小松町1", operator: OP, paidSeat: null, access: "京阪・祇園四条駅から徒歩約8分", note: "祇園の街なかウインズ。整備工事のため2026年6月6日〜2027年末頃まで営業休止中。" },
  { slug: "wins-umeda", name: "ウインズ梅田", org: "JRA", kind: "ウインズ", pref: "大阪府", region: "関西", address: "大阪府大阪市北区芝田2-1-16（A館）／芝田2-2-33（B館）", operator: OP, paidSeat: null, access: "阪急・大阪梅田駅から徒歩約3分／JR大阪駅から徒歩約5分" },
  { slug: "wins-dotonbori", name: "ウインズ道頓堀", org: "JRA", kind: "ウインズ", pref: "大阪府", region: "関西", address: "大阪府大阪市中央区道頓堀1-3-3", operator: OP, paidSeat: null, access: "日本橋駅から徒歩約5分", note: "道頓堀の繁華街のど真ん中。食い倒れの街のウインズ。" },
  { slug: "wins-namba", name: "ウインズ難波", org: "JRA", kind: "ウインズ", pref: "大阪府", region: "関西", address: "大阪府大阪市浪速区難波中2-10-70", operator: OP, paidSeat: null, access: "南海・なんば駅から徒歩約3分", note: "かつて中にあった兵庫競馬の難波場外発売所は廃止されたが、ウインズ難波自体は現役。" },
  { slug: "light-wins-rinku", name: "ライトウインズりんくうタウン", org: "JRA", kind: "ライトウインズ", pref: "大阪府", region: "関西", address: "大阪府泉佐野市りんくう往来北1番 りんくうパピリオ2階", operator: OP, paidSeat: null, access: "りんくうタウン駅の改札口すぐ" },
  { slug: "wins-kobe", name: "ウインズ神戸", org: "JRA", kind: "ウインズ", pref: "兵庫県", region: "関西", address: "兵庫県神戸市中央区元町通2-10-2（A館）／元町通3-7-1（B館）", operator: OP, paidSeat: null, access: "阪神・元町駅西口直結（A館）", note: "JRAのウインズ神戸。兵庫競馬の神戸場外発売所（旧ウインズ神戸B館）とは別の施設で、そちらは2026年に営業終了。" },
  { slug: "wins-himeji", name: "ウインズ姫路", org: "JRA", kind: "ウインズ", pref: "兵庫県", region: "関西", address: "兵庫県姫路市広峰2-7-80（姫路競馬場内）", operator: OP, paidSeat: null, access: "JR姫路駅から車約15分（無料送迎バスあり）", note: "地方の姫路競馬場の中にあるウインズ。" },
  { slug: "wins-yonago", name: "ウインズ米子", org: "JRA", kind: "ウインズ", pref: "鳥取県", region: "中国", address: "鳥取県米子市大崎3602-3", operator: OP, paidSeat: null, access: "JR米子駅から無料シャトルバス", note: "中国地方で数少ないウインズ。地方のBAOO鳥取岩美とあわせて山陰の場外文化を担う。" },
  { slug: "wins-hiroshima", name: "ウインズ広島", org: "JRA", kind: "ウインズ", pref: "広島県", region: "中国", address: "広島県広島市南区的場町1-1-8", operator: OP, paidSeat: null, access: "JR広島駅南口から徒歩5分" },
  { slug: "wins-ogori", name: "ウインズ小郡", org: "JRA", kind: "ウインズ", pref: "山口県", region: "中国", address: "山口県山口市小郡上郷5360", operator: OP, paidSeat: null, access: "新山口駅から車約10分" },
  { slug: "wins-takamatsu", name: "ウインズ高松", org: "JRA", kind: "ウインズ", pref: "香川県", region: "四国・九州", address: "香川県高松市田村町字中川原426-3", operator: OP, paidSeat: null, access: "JR高松駅・瓦町駅から無料送迎バス（競馬開催日）", note: "四国で唯一のウインズ。" },
  { slug: "excel-hakata", name: "エクセル博多", org: "JRA", kind: "エクセル", pref: "福岡県", region: "四国・九州", address: "福岡県福岡市博多区中洲3丁目7番地24号 gate's Bldg.4階", operator: OP, paidSeat: null, access: "地下鉄・中洲川端駅4番出口直結", note: "地方のBAOO博多と同じ中洲gate'sのビルに入る。" },
  { slug: "wins-yatsushiro", name: "ウインズ八代", org: "JRA", kind: "ウインズ", pref: "熊本県", region: "四国・九州", address: "熊本県八代市日奈久平成町1-13", operator: OP, paidSeat: null, access: "肥薩おれんじ鉄道・日奈久温泉駅から徒歩約25分", note: "日奈久温泉のそばのウインズ。" },
  { slug: "wins-miyazaki", name: "ウインズ宮崎", org: "JRA", kind: "ウインズ", pref: "宮崎県", region: "四国・九州", address: "宮崎県宮崎市花ケ島町大原2347（JRA宮崎育成牧場内）", operator: OP, paidSeat: null, access: "JR宮崎神宮駅から徒歩5分", note: "育成牧場の中にあるウインズ。" },
];
