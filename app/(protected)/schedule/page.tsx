"use client";
// カレンダー表示ページ

import Calendar from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, todayString } from "@/lib/date";
import { getCompanies, getSchedules } from "@/lib/firestore";
import type { Company } from "@/types/company";
import type { Schedule } from "@/types/schedule";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CalendarPage() {
  // 初期値のstartOfMonth(new Date())はページが読み込まれたときの日付からその月の1日を返す
  // 表示中の月に予定がないことをページが判断する（エンプティステート）には、ページが表示中の月を知っている必要がある→部品が持つと、ページは表示中の月を知ることができずエンプティステートを表示するかの判断ができない
  // ⭐︎ページ全体として予定を取ってくるようにしておけば、カレンダーにpropsで渡せて、カレンダーの下にある予定一覧でもそのまま使える。逆にページの一部品であるカレンダーが予定を取得する形にすると、ページでも部品でも予定を取り、処理が重複してしまう
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  // カレンダーで選んだ日の値をstateとしてもつ
  const [selectedDate, setSelectedDate] = useState(todayString());
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
  // filterで選ばれた日の予定を、取得した予定から取り出して配列を作る→sortをつなげてaとbを引き算(文字列のためlocaleCompare)して比べてマイナスならaを前にプラスならbを前に並べ替える。sortは元の配列を並べ替えるので直接stateに使うと意図せずstateを書き換えてしまうから注意
  // sort(a,b)の「a,b」は予定のオブジェクトそのものを表し、sortの元となる配列の中から二つの要素を比べる
  const selectedDateSchedules = schedules
    .filter((schedule) => schedule.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 予定一覧で選ばれた日の中身の表示の出しわけ
  let selectedDateContent;
  // 選ばれた日に予定がない場合
  if (selectedDateSchedules.length === 0) {
    selectedDateContent = <p>予定がありません</p>;
    // 選ばれた日に予定がある場合
  } else {
    selectedDateContent = (
      <ul>
        {selectedDateSchedules.map((schedule) => {
          // findは条件に合ったcompanyのオブジェクトを取ってくる→企業が削除されていた場合はundefinedが入る
          const foundCompany = companies.find((company) => (
            company.id === schedule.companyId
          ));
          // foundCompanyにundefinedが入っていた場合に「{foundCompany.name}」とするとエラーで止まるため表示を分ける
          const displayCompanyName = foundCompany ? foundCompany.name : "企業が見つかりません";
          return (
            <li key={schedule.id}>
              <Link href={`/schedule/${schedule.id}`}>{schedule.startTime}〜{schedule.endTime}・{displayCompanyName}・{schedule.type}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  // 予定一覧の表示を出し分ける
  let schedulesContent;
  // 予定が一件もない場合
  if (schedules.length === 0) {
    schedulesContent = (
      <div>
        <p>まだ予定がありません。最初の予定を登録しましょう！</p>
        <Link href="/schedule/new">最初の予定を登録する</Link>
      </div>
    );
  } else {
    schedulesContent = (
      <div>
        <h2>{selectedDate}の予定</h2>
        {/* 選ばれた日に予定がある場合とない場合を出し分ける */}
        {selectedDateContent}
      </div>
    );
  }

  return (
    <div>
      <h1>カレンダー</h1>
      {/* setDisplayMonthはDateを受け取ってstateを変える関数なので、部品が求める型と合う。部品はonChangeMonthをボタンで行き先の月を計算して呼ぶ */}
      <Calendar displayMonth={displayMonth} onChangeMonth={setDisplayMonth} scheduledDatesSet={scheduledDatesSet} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      {/* 予定一覧 */}
      <div>{schedulesContent}</div>
    </div>
  );
}
