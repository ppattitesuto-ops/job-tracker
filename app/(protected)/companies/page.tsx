"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getCompanies } from "@/lib/firestore";
import type { Company } from "@/types/company";
import { useEffect, useState } from "react";
// ページを移動する場合はLinkで移動する。a hrefはページ全体を再読み込みするから状態などもリロードされて非効率
import Link from "next/link";

export default function CompaniesPage() {
  // 企業で実際に扱うデータの配列、中に１つの企業ごとの情報がオブジェクトとして入ってる→useStateには型をつけてその型が配列からなると示してある。初期値から配列
  const [companies, setCompanies] = useState<Company[]>([]);
  // Firestoreからデータを取得する際のローディング確認、認証状態確認の時のローディングとは違う
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // 認証状態のloadingは使わないからuserだけ分割代入
  const { user } = useAuth();

  // リアクトのルール：useEffectに渡した関数の返り値が関数なら、後始末関数として保存する→今回はでーたをFirebaseからとってくるためasyncを書く必要があるが、asyncのついた関数の返り値は必ずPromiseになる。つまり、useEffectに渡す関数にasyncは書けない。だから、中で別の非同期関数を定義して呼ぶ形になる(下にあるloadのこと)
  useEffect(() => {
    // userがnullの場合を初めから早期リターンで消しておくことで中身をUserに絞っている、これがなくても動くけどコンパイル時に弾かれる
    if (!user) return;
    const load = async () => {
      setError("");
      // companiesの値をfirestoreからとってくるためにawaitを置いて、getCompaniesの引数にユーザーの識別子を入れて型にはめられたものを受け取っている
      try {
        setCompanies(await getCompanies(user.uid));
      } catch {
        setError("企業一覧の取得に失敗しました")
        //finally:tryとcatchのどちらの場合でも必ずやるべきこと
      } finally {
        // ここでローディングをfalseにしないと読み込み中の表示が残り続ける
        setLoading(false);
      }
    }
    // 最後変数の中に入れた関数を実行することで、useEffectにasyncのついた関数を渡すことなく別の非同期関数を実行することでクリーンアップ関数と勘違いされることを防いでいる
    load();
  }, [user]);

  // もしローディング中だったら
  if (loading) return <div>読み込み中</div>;
  // 通信が失敗してたら
  if (error) return <div>{error}</div>;
  // エンプティステート(登録企業情報が何もない時)
  if (companies.length === 0) return (
    <div>
      <div>まだ応募企業がありません。最初の企業を登録しましょう！</div>
      {/* 登録画面へとLinkを使って飛ばす */}
      <Link href="/companies/new">最初の企業を登録する</Link>
    </div>
  )

  return (
    <div>
      <h1>応募企業一覧</h1>
      {/* mapで配列からオブジェクト(一つ一つの企業情報)を取り出して、表示する */}
      {companies.map((company) => (
        // カード一つ一つにはキーをつける→リアクトは企業情報の同一性(前回の一覧のどの要素と、今回のどの要素が同じものかを対応づけること)をこのキーによって確認するためこれをCompanyのidに設定する
        // keyは「何番目か」ではなく「どれか」を表すものにする。indexを使うと、先頭を削除したとき React は「index0が消えた」ではなく、「index0の中身が変わった」と解釈してDOMを使い回す。表示は更新されるが入力値やフォーカスは残るため、隣の行に引き継がれる。つまり、固有のIDをキーに使う
        <div key={company.id}>
          {/* カード自体その詳しい情報が書いてあるページに飛ばすリンクをつける */}
          <Link href={`/companies/${company.id}`}>
            {/* それぞれの情報を取り出す */}
            <span>{company.name}</span>
            <span>{company.position}</span>
            <span>{company.appliedAt}</span>
            <span>{company.status}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
