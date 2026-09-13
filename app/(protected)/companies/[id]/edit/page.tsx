"use client";

// ページの仕事は「保存の仕方を渡す」「見出しを出す」「データを取ってくる」「取得を待つ(読み込み中・見つかりません)」「詳細ページへの戻るリンクを出す」になった

import CompanyForm from "@/components/CompanyForm";
import { useAuth } from "@/contexts/AuthContext";
import { getCompany, updateCompany } from "@/lib/firestore";
import type { CompanyInput } from "@/types/company";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCompany() {

  // 編集ページではFirestoreから受け取った値をidを除いた形に変えてその値をもとに処理する必要がある。editDataはその値を入れるための器。
  const [editData, setEditData] = useState<CompanyInput | null>(null);
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
        // getCompanyで受け取る値はIDと６項目のデータが入ったオブジェクト。しかし、編集ページで取り扱いのはID以外の６項目のためデータからIDを取り除く工程がいる。そのためまずは変数取ってきたオブジェクトを入れる。
        const companyData = await getCompany(user.uid, paramsId);
        if (!companyData) return;
        // 分割代入＋...rest（restCompanyInput)で指定したプロパティ(ここではid)とそれ以外の残りに右辺の内容を分割代入する。※eslint.config.mjsではidを使わなくても警告を出さないようにルールを自分用に上書きしている。
        // IDを除いた企業データを変数に入れる。
        const { id, ...restCompanyInput } = companyData;
        // 編集につかう値として更新関数でeditDataを更新する。
        setEditData(restCompanyInput);
      } catch {
        setError("企業データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, paramsId]);

  // 早期リターンの前に書くのはフック(useEffectなど)だけ。saveの定義は早期リターンよりあとでいい
  if (loading) return <div>読み込み中</div>;
  if (error) return <div>{error}</div>;
  if (!editData) return (
    <div>
      <div>見つかりません</div>
      <Link href="/companies">一覧ページへ戻る</Link>
    </div>
  );

  const save = async (data: CompanyInput): Promise<void> => {
    if (!user) throw new Error("ログイン状態が確認できません");
    await updateCompany(user.uid, paramsId, data);
    // 「バッククウォート(``)」は引用符の代わり、「""」の代わりになる。中で変数などを使いたい場合に引用符の代わりにバッククウォートを使う。二つ同時に入らない。どっちか一方だけ。
    router.push(`/companies/${paramsId}`);
  };

  return (
    <div>
      <h1>編集フォーム</h1>
      <div>
        <Link href={`/companies/${paramsId}`}>詳細ページに戻る</Link>
      </div>
      <CompanyForm save={save} initialData={editData} submitLabel="保存する" />
    </div>
  );
}

