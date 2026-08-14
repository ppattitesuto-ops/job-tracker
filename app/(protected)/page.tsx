"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

export default function Home() {

  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setError("");
    try {
      await signOut(auth);
    } catch {
      setError("ログアウトに失敗しました")
    }
  }

  return (
    <div>
      <div>ここはダッシュボードになる予定</div>
      {error && <div>{error}</div>}
      <button type="button" onClick={handleSignOut}>サインアウト</button>
    </div>

  );
}
