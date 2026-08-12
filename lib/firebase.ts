// ⭐️ここではFirebaseを初期化するだけ、データ取得はlib/firestore.tsを参照
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 初期化でFirebaseのどのプロジェクトを指すかの入り口を作る
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// getAppsで今入り口はあるかないか調べる。あるならgetAppで今あるものをとってくる。ないなら新しい入り口を作る
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// クラウドファイアーストアをアプリと繋げる
export const db = getFirestore(app);
// ユーザー認証をアプリと繋げる
export const auth = getAuth(app);