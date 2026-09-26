"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProtectedError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // 開発中に原因を追うためにコンソールに出す
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>エラーが発生しました</h2>
      {/* Firestoreのデータ取得の失敗はerror.tsxには届かない。各ページのtry/catchが受け取る。error.tsxが受け取るのは描画中に起きた想定外の例外。 */}
      <button onClick={() => retry()} type="button">もう一度読み込む</button>
      {/* 原因が一時的でない場合（データが壊れているなど）retry()してもまた落ちるだけなので別の出口を用意する */}
      <Link href="/">ダッシュボードへ戻る</Link>
    </div>
  )
}
