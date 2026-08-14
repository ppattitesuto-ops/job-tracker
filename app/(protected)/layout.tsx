"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

// childrenの値を受け取ってそれにたいして型をつける
export default function ProtectedLayout({ children }: { children: ReactNode }) {

  const { user, loading } = useAuth()
  const router = useRouter();

  // ローディングがfalse、ユーザー情報がない場合にloginページに遷移する処理
  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/login");
    }
  }, [user, loading, router])

  // ローディングがtrueなら読み込み中に表示を切り替える
  if (loading) return <div>読み込み中...</div>;
  // ユーザー情報がnullなら何も表示しない→loginページに飛ぶ
  if (!user) return null;
  // ローディングがfalseでユーザー情報があるならprotectedに包まれたもの（children)を表示する
  return <>{children}</>;
}
