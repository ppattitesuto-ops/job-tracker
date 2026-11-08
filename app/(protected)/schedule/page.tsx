"use client";
// カレンダー表示ページ
import Calendar from "@/components/Calendar";
import { startOfMonth } from "@/lib/date";
import { useState } from "react";

export default function CalendarPage() {
  // 初期値のstartOfMonth(new Date())はページが読み込まれたときの日付からその月の1日を返す
  // 表示中の月に予定がないことをページが判断する（エンプティステート）には、ページが表示中の月を知っている必要がある→部品が持つと、ページは表示中の月を知ることができずエンプティステートを表示するかの判断ができない
  // ⭐︎ページ全体として予定を取ってくるようにしておけば、カレンダーにpropsで渡せて、カレンダーの下にある予定一覧でもそのまま使える。逆にページの一部品であるカレンダーが予定を取得する形にすると、ページでも部品でも予定を取り、処理が重複してしまう
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));

  return (
    <div>
      <h1>カレンダー</h1>
      {/* setDisplayMonthはDateを受け取ってstateを変える関数なので、部品が求める型と合う。部品はonChangeMonthをボタンで行き先の月を計算して呼ぶ */}
      <Calendar displayMonth={displayMonth} onChangeMonth={setDisplayMonth}/>
    </div>
  );
}
