// ⭐️日付の計算とYYYY-MM-DDへの変換をまとめる所

// Date(new Date()で作られたもの)を受け取って、YYYY-MM-DD（ハイフン区切り）の文字列を返す
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
  // new Date()には最低限「年・月」を入れる日は入れなければ1日、それ以降(時, 分, 秒, ミリ秒)は0になる
  const now = new Date();
  // formatYmd(now)は、nowをYYYY-MM-DDの文字列に変換する
  return formatYmd(now);
}

// 渡された日付をその月の1日に揃えて返す
// もし次の月へ移動する場合に渡された日付が10月31日だった場合、次の11月31日に移動しようとするが、11月には30日しかないため、12月1日に移動してしまう。そのため、渡された日付を1日に揃えることで次の月へ移動する際に正しく移動できるようになる。また、先頭の空白の数を決める際にその月の1日の曜日が必要なためでもある。
export function startOfMonth(date: Date): Date {
  // 渡された日付の年、月、1日をnew Dateに渡して、その月の1日の日付を返す
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 1日に揃えた月のDateと月数(次の月か前の月か、1,-1)を受け取って、ずらした月の1日を返す
export function addMonths(date: Date, months: number): Date {
  // Dateの月に12や-1が入る場合、Dateは自動で年を跨いで繰り上げ・繰り下げをしてくれる
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

// 1日に揃えた月のDateを受け取って、その月の日数を返す
export function daysInMonth(date: Date): number {
  // 渡された月に+1して、0日にすることで、日付が渡された日付の最終日になる。(11月が渡された→12月0日を作る→Dateが11月30日に変換する)
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDate.getDate();
}

// 1日に揃えた月のDateを受け取って、その月の最初の日の曜日を返す→日曜が0で月曜が1となり、その数字が先頭の空白のマスの数になる
export function firstWeekdayOfMonth(date: Date): number {
  return date.getDay();
}

// カレンダーのマスを作る関数
// 1日に揃えた月のDateを受け取って、日付(Date)か空白(null)の配列を返す
export function createCalendarCells(date: Date): (Date | null)[] {
  // これから入れるマスのために空の配列を作る
  const cells: (Date | null)[] = [];
  // 渡された月の最初の週の空白を調べる
  const blankCells = firstWeekdayOfMonth(date);
  // for文内でpushを使って空白(null)を配列の中に入れる
  for (let i = 0; i < blankCells; i++) {
    cells.push(null);
  }
  // 渡された月の日数を調べる
  const days = daysInMonth(date);
  // for文内でpushを使って日付(Date)を配列の中に入れる
  // 変数名をiではなくdayにして今何日か分かるようにした
  for (let day = 1; day <= days; day++) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day));
  }
  return cells;
}
