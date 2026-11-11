"use client";
// カレンダー表示ページ

import Calendar from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth } from "@/lib/date";
import { getCompanies, getSchedules } from "@/lib/firestore";
import type { Company } from "@/types/company";
import type { Schedule } from "@/types/schedule";
import { useEffect, useState } from "react";

export default function CalendarPage() {
  // 初期値のstartOfMonth(new Date())はページが読み込まれたときの日付からその月の1日を返す
  // 表示中の月に予定がないことをページが判断する（エンプティステート）には、ページが表示中の月を知っている必要がある→部品が持つと、ページは表示中の月を知ることができずエンプティステートを表示するかの判断ができない
  // ⭐︎ページ全体として予定を取ってくるようにしておけば、カレンダーにpropsで渡せて、カレンダーの下にある予定一覧でもそのまま使える。逆にページの一部品であるカレンダーが予定を取得する形にすると、ページでも部品でも予定を取り、処理が重複してしまう
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setError("");
      try {
        const [companiesData, schedulesData] = await Promise.all([getCompanies(user.uid), getSchedules(user.uid)]);
        setCompanies(companiesData);
        setSchedules(schedulesData);
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div>データを取得しています</div>;
  if (error) return <div>{error}</div>;

  // 部品のカレンダーで予定のある日に印をつけるため、予定の配列から日付だけの配列を作る
  // map内は一つの式しかない場合は()で囲む。複数の文を書く場合は{}で囲みreturnで結果を返す。今回は1行で式も短いので()もいらない
  const scheduledDates = schedules.map((schedule) => schedule.date);

  // new Set():予定がある日付の配列で値が重複していたら一つにする
  const scheduledDatesSet = new Set(scheduledDates);

  return (
    <div>
      <h1>カレンダー</h1>
      {/* setDisplayMonthはDateを受け取ってstateを変える関数なので、部品が求める型と合う。部品はonChangeMonthをボタンで行き先の月を計算して呼ぶ */}
      <Calendar displayMonth={displayMonth} onChangeMonth={setDisplayMonth} scheduledDatesSet={scheduledDatesSet} />
    </div>
  );
}
