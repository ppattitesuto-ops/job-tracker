"use client";
// 予定登録ページ

import ScheduleForm from "@/components/ScheduleForm";
import { useAuth } from "@/contexts/AuthContext";
import { addSchedule, getCompanies } from "@/lib/firestore";
import type { Company } from "@/types/company";
import type { ScheduleFormValues, ScheduleInput } from "@/types/schedule";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewSchedulePage() {
  const newData: ScheduleFormValues = {
    // 企業の登録画面では日付の初期値を当日に固定したが、予定の場合はほとんどが未来の日であることが多い。書き換え忘れを防止するためにも空にしておく
    date: "",
    startTime: "",
    endTime: "",
    // 種別は面接が最も多いと考えたため初期値にした
    type: "面接",
    // ScheduleFormでvalueが""の場合に<選択してください>が表示されるようになっている
    companyId: "",
    location: "",
    preparation: "",
    belongings: "",
  };
  // フォームへのpropsやエンプティステート表示のために使う
  const [companies, setCompanies] = useState<Company[]>([]);
  // Firestoreからデータを取得する際のローディング確認、認証状態確認の時のローディングとは違う
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // 認証状態のloadingは使わないからuserだけ分割代入
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setError("");
      try {
        setCompanies(await getCompanies(user.uid));
      } catch {
        setError("企業情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <div>データを取得しています</div>;
  if (error) return <div>{error}</div>;
  // エンプティステート
  if (companies.length === 0) return (
    <div>
      {/* 企業情報がない場合は予定よりも先に企業を登録する方向誘導する */}
      <div>先に企業を登録してください</div>
      <Link href="/companies/new">最初の企業を登録する</Link>
    </div>
  );

  const save = async (data: ScheduleInput): Promise<void> => {
    // 通常のページからの早期リターンはフォームへの処理成功の返事になってしまうため、throwを使うことでフォーム側でcatchに処理を合流させるようにしている
    if (!user) throw new Error("ログイン状態が確認できません");
    // addScheduleで新しいドキュメントのidを受け取る
    const newScheduleId = await addSchedule(user.uid, data);
    // 詳細ページに遷移する
    router.push(`/schedule/${newScheduleId}`);
  };

  return (
    <div>
      <h1>予定登録フォーム</h1>
      {/* companiesの中でフォームで使うのはidとnameだけだが、propsとして渡された余分なものは無視されるためこのままでいい。ただし、フォームで指定したidとname以外は使えない */}
      <ScheduleForm save={save} initialData={newData} submitLabel="登録する" companyOptions={companies} />
    </div>
  );
}
