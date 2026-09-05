// ⭐️ここはデータの判定を書くところ

// 受け取ったurlから「http:かhttps:」かを判定して真偽値を返す(: boolean)関数
export function isHttpUrl(url: string): boolean {
  try {
    // この関数の返り値には出口が３種類ある
    // ①形式の検査(new URL):解析できなければ例外を投げる→catchに落ちる→falseを返す
    // urlの解析("https:","example.com","job/123"などの部品に分けてオブジェクトを作る)
    // ②③内容の検査:解析できればprotocolを取り出して「http:かhttps:」かを判定する→trueかfalseを返す
    const urlObject = new URL(url);
    // 条件をそのまま判定結果として使うことで、if文の時は返す道が２つ(returnが２つ)だったのが１つになった。
    return urlObject.protocol === "http:" || urlObject.protocol === "https:";
  } catch {
    return false;
  }
}
