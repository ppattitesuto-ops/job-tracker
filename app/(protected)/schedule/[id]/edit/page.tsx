"use client";
// 予定編集ページ

import ScheduleForm from "@/components/ScheduleForm";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanies, getSchedule, updateSchedule } from "@/lib/firestore";
import { toScheduleFormValues } from "@/lib/schedule";
import type { Company } from "@/types/company";
import type { ScheduleFormValues, ScheduleInput } from "@/types/schedule";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditSchedulePage() {

  const [editData, setEditData] = useState<ScheduleFormValues | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCompanyMissing, setIsCompanyMissing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const paramsId = params.id as string;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setError("");
      try {
        // Promise.all()を使うことで二つの非同期処理を同時に進める。→両方の取得が終わるまで次の処理に行かない
        const [companiesData, scheduleData] = await Promise.all([getCompanies(user.uid), getSchedule(user.uid, paramsId)]);
        // ここで予定がnullの場合はこの後の処理を行う必要がないのでreturnする
        if (!scheduleData) return;
        // 予定がある場合に企業の一覧をpropsとしてフォームに渡すcompaniesに入れる
        setCompanies(companiesData);
        // 予定をidとそれ以外の項目に分ける
        const { id, ...restScheduleData } = scheduleData;
        // 取得した予定からidを取り除いたrestScheduleDataをフォームの値に変換する
        const fetchedScheduleFormValues = toScheduleFormValues(restScheduleData);
        // 「isCompanyFound」は企業が見つかったという意味。isは「〜である」を表す。
        // 企業の一覧にあるidと予定から取得したcompanyIdを照合する。予定と対応する企業データが削除されている場合をケアする→もしこれの判定をしないと画面には「選択してください」と出るが選ばずに送信したとしてもcompanyIdの中身は入っているのでそのまま消された企業と紐付いたまま予定を保存できてしまう。
        // ⭐️根本の原因はFirestoreは参照先の存在を保証しないことにある。RDBなら外部キーで守れる部分をアプリ側で守る必要がある。
        // 配列.some()は条件で指定したもので配列の中身を照合して真偽値を返す
        const isCompanyFound = companiesData.some((companyData) => companyData.id === restScheduleData.companyId);
        // 企業が見つからない場合はそれを画面の表示に出す
        setIsCompanyMissing(!isCompanyFound);
        // 条件によって2つのうちどちらかの値を選ぶときは、ifより三項演算子が向いている→結果を一つの変数で受け取れるから。
        const initialScheduleFormValues = isCompanyFound ? fetchedScheduleFormValues : { ...fetchedScheduleFormValues, companyId: "" };
        setEditData(initialScheduleFormValues);
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, paramsId]);

  if (loading) return <div>データを取得しています</div>;
  if (error) return <div>{error}</div>;
  if (!editData) return (
    <div>
      <div>見つかりません</div>
      {/* 今はまだカレンダーページを作っていないためリンクは置かない→PR3でカレンダーへ戻るリンクを足す */}
    </div>
  );

  const save = async (data: ScheduleInput): Promise<void> => {
    if (!user) throw new Error("ログイン状態が確認できません");
    await updateSchedule(user.uid, paramsId, data);
    router.push(`/schedule/${paramsId}`);
  };

  return (
    <div>
      <h1>予定編集フォーム</h1>
      <div>
        <Link href={`/schedule/${paramsId}`}>詳細ページに戻る</Link>
      </div>
      {/* 企業一覧にあるidと紐づく予定の企業idを照合して同じものが見つからなかったらこれを出す */}
      {isCompanyMissing && <div>紐づいていた企業が見つからないため、企業を選び直してください</div>}
      <ScheduleForm save={save} initialData={editData} submitLabel="保存する" companyOptions={companies} />
    </div>
  );
}

