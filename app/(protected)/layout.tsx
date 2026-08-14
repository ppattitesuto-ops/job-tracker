"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {

  const { user, loading } = useAuth()
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/login");
    }
  }, [user, loading, router])

  if (loading) return <div>読み込み中...</div>;
  if (!user) return null;
  return <>{children}</>;
}