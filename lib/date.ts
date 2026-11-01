// ⭐️日付の計算とYYYY-MM-DDへの変換をまとめる所

// Dateを受け取って、YYYY-MM-DD（ハイフン区切り）の文字列を返す
export function formatYmd(date: Date): string {
  // toISOString()は世界標準時の日付を返すので、日本の朝9時前には前の日になってしまう
  // getFullYear()・getMonth()・getDate()は、その端末の時刻（日本時間）で年月日を返す
  const yyyy = date.getFullYear();
  // Dateは月を0から数えるので、「＋１」して１から数える形にしている
  // padStartは(目標の長さ、埋める文字)→文字にしか使えない
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 今日の日付をformatYmdに渡して、YYYY-MM-DDの文字列で返す
export function todayString(): string {
  // new Date()が返すもの：日付と時刻を持った値(オブジェクト)→文字で表示すると「Sat Oct 31 2026 07:35:16 GMT+0900 (日本標準時)」のようになる
  const now = new Date();
  // formatYmd(now)は、nowをYYYY-MM-DDの文字列に変換する
  return formatYmd(now);
}
