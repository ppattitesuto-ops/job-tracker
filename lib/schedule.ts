// ⭐️予定のデータを調べて、作り変える
import type { ScheduleFormValues, ScheduleInput, ScheduleFormErrors } from "@/types/schedule";

// 予定フォームを保存するときの形に作り直す関数
export function toScheduleInput(data: ScheduleFormValues): ScheduleInput {
  return {
    ...data,
    // 下にある項目以外はそのまま決まった形しか入らないため変換をしていない。
    location: data.location.trim(),
    preparation: data.preparation.trim(),
    // splitで改行ごとに要素を分ける。\nは改行を表す
    // mapで各要素の前後から空白を取り除く
    // filterで空行(空文字)を取り除く
    // 箇条書きの表示や将来の持ち物チェックに使いやすいから、フォームを保存するとき用に改行ごとに分けて配列にしている。変換は保存の前に一度だけ行う。
    belongings: data.belongings
      .split("\n")
      .map((belonging) => belonging.trim())
      .filter((belonging) => belonging !== ""),
  };
}

// 予定を保存する際に検査する関数
// 企業と同じで変換は検査と保存の前に一回だけして、同じ値をそれぞれに渡す
export function validateScheduleInput(data: ScheduleInput): ScheduleFormErrors {
  // locationがURLかどうかは表示する時に判定する→住所も入力できるから入力時には検査できない
  // typeは最初から「面接」が選ばれていて、四つのどれかしか入らないから検査しない
  const errors: ScheduleFormErrors = {};
  if (data.date === "") {
    errors.date = "日付が入力されていません";
  }
  if (data.startTime === "") {
    errors.startTime = "開始時刻が入力されていません";
  }
  if (data.endTime === "") {
    errors.endTime = "終了時刻が入力されていません";
  }
  // 開始と終了は空白の場合と開始が終了よりも後に設定されている条件を分けて書いた。一つの欄に一つの文しか持てず、後に書いた方が上書きするので、二つの条件が同時に起きないようにした。
  // 時刻の比較のエラーを終了の欄に出す理由は、最初よりも最後にエラーが出た方がユーザーが注目しやすいと考えたから
  // 時刻は2桁・24時間表記と決めてあるため、文字列のまま比べられる
  if (data.startTime !== "" && data.endTime !== "" && data.startTime > data.endTime) {
    errors.endTime = "開始時刻が終了時刻よりも後に設定されています";
  }
  // 企業の選択を必須にすることで意図しない企業で予定を登録することを防いだり、間違えて紐付けた企業を削除すると連鎖削除でこの予定も一緒に消えることを防いでいる
  if (data.companyId === "") {
    errors.companyId = "企業を選択してください";
  }
  return errors;
}
