// ⭐️ここはカレンダーを使うページからPropsを受け取ってカレンダーを表示するところ

import { addMonths, createCalendarCells, formatYmd, startOfMonth } from "@/lib/date";
import Button from "./Button";

type Props = {
  displayMonth: Date;
  onChangeMonth: (month: Date) => void;
};

// 固定の値を変数に持つ場合は名前をすべて大文字のスネークケースにする
const CALENDAR_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 画面に表示中の月を受け取ってカレンダーを描画する
export default function Calendar({ displayMonth, onChangeMonth }: Props) {
  const calendarCells = createCalendarCells(displayMonth);
  return (
    <div>
      <Button
        variant="secondary"
        type="button"
        onClick={() => onChangeMonth(addMonths(displayMonth, -1))}
      >
        前の月へ
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => onChangeMonth(startOfMonth(new Date()))}
      >
        今の月へ
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => onChangeMonth(addMonths(displayMonth, 1))}
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
        {calendarCells.map((calendarCell, index) => (
          // <div key={index}/>は中身がないとき(null)を表す
          calendarCell ? <div key={formatYmd(calendarCell)}>{calendarCell.getDate()}</div> : <div key={index} />
        ))}
      </div>
    </div>
  );
}
