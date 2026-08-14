// useStateなどの状態を扱う必要が合うのでクライアントコンポーネントにする必要がある
"use client";
// 下にあるReactはReact.SubmitEventを使うのに必要、export defaultなので{}の中にない
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/authErrors";

export default function LoginPage() {

  // 分割代入：useStateは[値,更新関数]という配列を返す、だからこの形で代入してる
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // modeによって新規登録とログインボタンを同じページ内で使い分ける
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  // 分割代入：useAuthは{user, loading}というオブジェクトを返す、だからこの形でキーを指定して値を代入してる
  const { user, loading } = useAuth()
  // useRouterはページ移動を操作するためのオブジェクトを返す
  const router = useRouter();
  // ※フックは必ずトップレベルに、じゃないと状態の順番が変わる


  useEffect(() => {
    if (!loading && user) {
      // これにより今のURLをapp/page.tsxに変える、replaceはURLを変えてそのURLに対応するページを表示する。
      router.replace("/");
    }
  }, [user, loading, router])


  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch(err) {
      setError(getAuthErrorMessage(err));
    }
  }

  const handleGoogleSignIn = async () => {
    setError("");
    // ここでのGoogleAuthProvider(クラス：設計図)の役割は宛先の指定、つまり認証の本人であるということをGoogleに聞きにいくということをしている。あくまで必要な情報を渡すための設定にすぎない。providerは他の権限も追加できるためこのような設定のような役割になってる。newによって設計図からインスタンスを一つ作っている。※変数に入れないと消えるから入れる
    const provider = new GoogleAuthProvider();
    try {
      // signInWithPopupにproviderは認証できる場所の位置を教える。
      await signInWithPopup(auth, provider)
    } catch(err) {
      // getAuthErrorMessage(err)で実行された返り値がsetErrorにセットされる。
      setError(getAuthErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>ログイン画面</div>
      {/* 条件付きレンダリング（＆＆）でエラーがあるなら出す、ないなら出さない、errorが空文字だからそのまま画面に出して何も表示されないけど、０などのならそのまま表示されるから気を付ける→真偽値への変更など*/}
      {error && <div>{error}</div>}
      <button type="button" onClick={handleGoogleSignIn}>Googleでログイン</button>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          placeholder="メールアドレスを入力してください"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          placeholder="パスワードを入力してください"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button type="submit">
          {mode === "login" ? "ログイン" : "新規登録"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "新規登録はこちら" : "ログインはこちら"}
        </button>
      </div>
    </form>
  );
} 