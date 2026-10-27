"use client";
// 予定詳細ページ

import { useAuth } from "@/contexts/AuthContext";
import { getCompany, getSchedule } from "@/lib/firestore";
import { isHttpUrl } from "@/lib/validation";
import type { Company } from "@/types/company";
import type { Schedule } from "@/types/schedule";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SchedulePage() {

  const [company, setCompany] = useState<Company | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const params = useParams();
  const paramsId = params.id as string;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setError("");
      try {
        // setScheduleしてもこの関数の中のscheduleには古い値(null)が入る。→stateの更新は次の描画で反映されるため。だから、取ってきた最新の予定を変数に入れて使う。早期リターンと企業のidで使用
        const fetchedSchedule = await getSchedule(user.uid, paramsId);
        setSchedule(fetchedSchedule);
        // 取ってきた予定がnullなら企業データは取らない
        // tryの中でreturnしてもfinallyは動くので読み込み中のまま止まることはない
        if (!fetchedSchedule) return;
        // getCompanyのidに予定のcompanyIdを指定することで対応する企業のデータを取ってくる
        setCompany(await getCompany(user.uid, fetchedSchedule.companyId));
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, paramsId]);

  if (loading) return <div>データを取得しています</div>;
  if (error) return <div>{error}</div>;
  if (!schedule) return (
    <div>
      <div>予定が見つかりません</div>
      {/* 今はまだカレンダーページを作っていないためリンクは置かない→PR3でカレンダーへ戻るリンクを足す */}
    </div>
  );

  // 場所について表示を切り分ける
  let locationContent;
  if (schedule.location.trim() === "") {
    locationContent = <span>場所が入力されていません</span>;
  } else if (!isHttpUrl(schedule.location)) {
    // URLが中になかったら住所の可能性が高いためそのまま表示する
    // もしjavascript:がここにきたとしてもホワイトリスト(isHttpUrl)のおかげでリンクにならない
    locationContent = <span>{schedule.location}</span>;
  } else {
    // URLと判定されたら外部URLとしてリンクを設定する
    locationContent = <a href={schedule.location} target="_blank" rel="noopener noreferrer">{schedule.location}</a>;
  }

  // 準備することについて表示を切り分ける
  let preparationContent;
  // ないならなしと表示
  if (schedule.preparation.trim() === "") {
    preparationContent = <span>なし</span>;
  } else {
    // あるなら改行をそのまま、続く空白を一つにまとめて表示する(whitespace-pre-line)
    preparationContent = <span className="whitespace-pre-line">{schedule.preparation}</span>;
  }

  // 持ち物について表示を切り分ける
  let belongingsContent;
  // ないならなしと表示
  if (schedule.belongings.length === 0) {
    belongingsContent = <span>なし</span>;
  } else {
    belongingsContent = (
      <ul>
        {/* belongingsは保存するときに行ごとに分けた配列になっているため、そのままmapで回す*/}
        {/* mapは第二引数に「何番目か」を受け取れる。→keyをインデックスにした理由は持ち物は表示だけで並び替えも追加しないためインデックスでも表示が崩れず、同じ持ち物が2行あっても重ならないから */}
        {schedule.belongings.map((belonging, index) => (
          <li key={index}>
            {belonging}
          </li>
        ))}
      </ul>);
  }

  return (
    <div>
      <h1>予定情報の詳細</h1>

      <dl>
        <dt>日付</dt>
        <dd>{schedule.date}</dd>

        <dt>開始〜終了</dt>
        <dd>{schedule.startTime}〜{schedule.endTime}</dd>

        <dt>種別</dt>
        <dd>{schedule.type}</dd>

        <dt>企業</dt>
        {/* 三項演算子で企業があるときはその企業詳細へのリンク、ない場合はそれを画面に出す*/}
        {/* Firestoreには、参照先が必ず存在することを保証する仕組みが無い。だから、連鎖削除を入れた後も、この(削除された可能性があります)表示は残す*/}
        <dd>{company ? <Link href={`/companies/${company.id}`}>{company.name}</Link> : "企業が見つかりません(削除された可能性があります)"}</dd>

        <dt>場所</dt>
        <dd>{locationContent}</dd>

        <dt>準備すること</dt>
        <dd>{preparationContent}</dd>

        <dt>持ち物</dt>
        <dd>{belongingsContent}</dd>

      </dl>
    </div>
  );
}
