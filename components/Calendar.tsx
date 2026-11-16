// ⭐️ここはカレンダーの部品。表示中の月はCalendarしか使わないので自分で持つ。選んだ日は下の一覧でも使うので、ページが持つ

import { addMonths, createCalendarCells, formatYmd, startOfMonth, todayString } from "@/lib/date";
import Button from "./Button";
import { useState } from "react";

type Props = {
  // Set<string>：予定がある日付（YYYY-MM-DDの文字列）を、重複なしで集めたもの
  // <>は型引数という。Setという集まりの中に何が入るのかを指定する。関数の引数が「値」を受け取るように、型が「型」を受け取る仕組み。
  scheduledDatesSet: Set<string>;
  // 選ばれた日付（YYYY-MM-DDの文字列）が入る
  selectedDate: string;
  // 押された日付を受け取るから引数の型はstring
  onSelectDate: (date: string) => void;
};

// 固定の値を変数に持つ場合は名前をすべて大文字のスネークケースにする
const CALENDAR_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ scheduledDatesSet, selectedDate, onSelectDate }: Props) {
  // 初期値のstartOfMonth(new Date())はデータを取り終わってCalendarが初めて表示されたときの日付からその月の1日を返す
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));

  const calendarCells = createCalendarCells(displayMonth);

  // 部品が描画されるたびに今日の日付として変わって欲しいからコンポーネントの中に置く
  const today = todayString();

  return (
    <div>
      <Button
        variant="secondary"
        type="button"
        onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
      >
        前の月へ
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => setDisplayMonth(startOfMonth(new Date()))}
      >
        今月へ
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
      >
        次の月へ
      </Button>
      {/* タグの属性の中では文字と値({})を一緒に使えないが、タグの間では同時に使える */}
      <h2>{displayMonth.getFullYear()}年{displayMonth.getMonth() + 1}月</h2>
      {/* grid:中の要素を格子状に並べる、grid-cols-7:7列にする。→この二つを親につけるだけでこの要素が7つごとに自動で折り返してくれる */}
      <div className="grid grid-cols-7">
        {/* 曜日を７列に並べる */}
        {CALENDAR_WEEKDAYS.map((calendarWeekday) => (
          <div key={calendarWeekday}>{calendarWeekday}</div>
        ))}
        {/* 受け取ったDateに対応した空白と日付を並べる */}
        {calendarCells.map((calendarCell, index) => {
          // 空白(null)にはformatYmdを渡せないのでリターンする
          if (calendarCell === null) {
            // <div key={index}/>は中身がないとき(null)を表す
            return (
              <div key={index} />
            );
          }
          // このマスの日付の文字列
          const cellYmd = formatYmd(calendarCell);
          // ===はオブジェクト同士だと「中身が同じか」でなく、「同じ一つのオブジェクトか」を比べる。マスのDateと今日の値(todayString)はそれぞれ別々に作ったもので時刻も違う可能性がある。そのため、文字列にしてから比べる必要がある
          const isToday = cellYmd === today;
          // 選ばれた日付をマスの日付と比較して判定する
          const isSelectedDate = cellYmd === selectedDate;
          // 予定された日付の集まり.has(調べる値)→あればtrue
          const hasScheduledDate = scheduledDatesSet.has(cellYmd);

          return (
            // 部品のボタンを使わなかった理由は、カレンダーで選ばれた日には背景を塗りつぶしてそれがわかるようにする必要があるが、部品のボタンにはそれと合うデザインがなかったため例外的に素のボタンで対応した
            <button
              type="button"
              onClick={() => onSelectDate(cellYmd)}
              key={cellYmd}
              // ringはborderと違いマスの外側に影として線を描くためマスの大きさが変わらない
              className={`${isToday ? "font-bold ring-2 ring-indigo-500" : ""} ${isSelectedDate ? "bg-indigo-100" : ""}`}
            >
              {calendarCell.getDate()}
              {/* 予定があるか判定してあるならマスに点をつける */}
              {hasScheduledDate && <span className="block h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
