"use client";
// カレンダー表示ページ
import Calendar from "@/components/Calendar";
import { startOfMonth } from "@/lib/date";
import { useState } from "react";

export default function CalendarPage() {
  // 初期値のstartOfMonth(new Date())はページが読み込まれたときの日付からその月の1日を返す
  // stateをページに置いたのは、PR3-2でページが「表示中の月の予定」を取ってくるため→もし部品がstateを持つとページは表示中の月を知らないため対応する予定をFirestoreからとってくることができない→ページに一つ置けば、月が変わると予定も取り直されて部品には両方が揃って届く
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
