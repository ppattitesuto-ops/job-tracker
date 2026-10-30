// ⭐️日付の計算とYYYY-MM-DDへの変換をまとめる所

// 今日の日付を YYYY-MM-DD の文字列で返す
export function todayString(): string {
  // toISOString()は世界標準時の日付を返すので、日本の朝9時前には前の日になってしまう
  // getFullYear()・getMonth()・getDate()は、その端末の時刻（日本時間）で年月日を返す
  const now = new Date();
  const yyyy = now.getFullYear();
  // Dateは月を0から数えるので、「＋１」して１から数える形にしている
  // padStartは(目標の長さ、埋める文字)→文字にしか使えない
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
