"use client";

import { onAuthStateChanged } from "firebase/auth";
// firebaseからユーザーに当てはめる型をインポート
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
// createContext=reactから状態を入れる器を作るためのメソッドをインポート,useEffect=レンダリング以外に他の場所とやりとりする処理
import { createContext, useEffect, useState, useContext } from "react";
import type { ReactNode } from "react";

// ユーザー認証状態とローディング状態に型をつける、booleanは中身が真偽値ということ
// user: User | null;このコードはfibase側が元々定義しており、ユーザーがその方に合わせる形になっている
type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

// ①Contextを入れるための器を作る、初期値→undefinedにすることでProviderの外だと一目でわかるようになる
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 状態を作る関数（AuthProvider)：Firebase を購読して user と loading を持つ
export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // コールバック関数によってfirebaseにこの関数の呼び出すタイミングを決めさせる
      // 条件分岐はいらない。なぜならonAuthStateChangedによって返される値はUser | null;だから。初期値がnullのためそのコードが無駄になる。
      setUser(currentUser);
      setLoading(false);
    });
    // クリーンアップ関数(後始末関数):これがないと上で読んだログイン状態を見張るロボットがこのファイルが描画されてなくても動き続けて、監視が積み重なると余計に重くなる→何かを監視する自動ロボットを作った場合はそれを終わらす処理も必要
    return unsubscribe;
  }, [])

  // ②渡された値を配る係（AuthContent.Provider）：{ user: user, loading: loading }が本来の形だが、キー名と変数名が同じのため省略記法で書いている
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ③値を読む関数（useAuthuseAuth）：認証やローディングの確認を他ファイルから受け取るための関数、そして、AuthProviderよりも外側で呼ばれた場合の予防策でもある。
export function useAuth() {
  // useContextは引数に入った②のAuthContext の Provider（器）から値を取ってくる→user, loading、undefinedの値を他ファイルから読む。だからexportしてある。
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth は <AuthProvider> の内側で使ってください")
  }
  return context;
}
