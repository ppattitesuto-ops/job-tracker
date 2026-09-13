"use client";

// ページの仕事は「初期値を作る」「保存の仕方を渡す」「見出しを出す」になった

import CompanyForm from "@/components/CompanyForm";
import { useAuth } from "@/contexts/AuthContext";
import { addCompany } from "@/lib/firestore";
import type { CompanyInput } from "@/types/company";
import { useRouter } from "next/navigation";

// appliedAtの初期値として使うために、コンポーネントの外側に日付の計算処理を用意する。コンポーネントの外側に置くのは設計のため、todayStringはこのコンポーネントのstateを一切見ていません、独立した計算です。というのをコンポーネントの外に置くことで分からせる。
function todayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  // padStartは(目標の長さ、埋める文字)→文字にしか使えない
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewCompanyPage() {
  // CompanyInput：ID以外の要素を指定(登録の際にはまだIDはないため)→ここで初期値に対して型をつけることでstatusがstringと推論されることを防ぐ。CompanyInputがなかったらstatusは７つの値から選ばれるというのが機械には分からない。
  // 6項目の値をオブジェクトでFormに渡す初期値として作る
  const newData: CompanyInput = {
    name: "",
    position: "",
    // 登録する時が応募日になることが多いため初期値は当日、コンポーネントが描画されるたびに初期値が渡される。
    // CompanyForm.tsxのuseStateでは、コンポーネントが描画されるたびに初期値が渡されるが、useStateによって毎回捨てられる。描画のたびに渡される初期値を追随していたらユーザーが入力した値に更新されないから。もし自分でstateを変えたならその値が入る。初期値はあくまで最初の一回だけ。
    appliedAt: todayString(),
    status: "応募済",
    jobUrl: "",
    memo: "",
  };
  const { user } = useAuth();
  const router = useRouter();

  // 引数は推論できないから型を書いている。書かなければ暗黙のanyとしてstrict設定に弾かれる。
  // 返り値は推論できるがこう返すという約束を表明している。async関数だからPromise<void>になる。
  const save = async (data: CompanyInput): Promise<void> => {
    // 登録と編集ページをCompanyForm.tsxに統合前：if (!user) return; は「この関数をここで終わらせる早期リターン」だった
    // 今：saveの終わり方がフォームへの返事になった。return は「成功しました」という返事になってしまう→このまま何もしないとnullで早期リターンした場合に成功したと思ってfinallyにいき送信ボタンは押せるようになるが、保存はnullのためされておらずcatchにもいかないためエラーも出ない形になってしまう。
    // だから null の場合は throw して、例外という通り道で catch に合流させる→本来「app/(protected)/layout.tsx」でuserがnullの場合はログイン画面に遷移させる設計になっており、ページにおいてuserがnullになることはないが、エラーへの道は作っておく。
    if (!user) throw new Error("ログイン状態が確認できません");
    await addCompany(user.uid, data);
    // データの登録が成功したときにページを遷移させたいからここにおく
    router.push("/companies");
  };

  return (
    <div>
      <h1>登録フォーム</h1>
      {/* CompanyFormにpropsで渡すときに何で囲むかの基準は「JavaScriptの式か文字列そのものか」で使い分ける */}
      {/* 実際の型検査はここのpropsを渡すところでコンパイル時(typecheck や build のときに検査される)に行われる。→npm run devは型を消してJSに変換するだけ。  */}
      {/* ここでリアクトは属性(save initialData submitLabel)を一つのオブジェクトにする。→リアクトがCompanyFormを呼ぶときの引数になる */}
      <CompanyForm save={save} initialData={newData} submitLabel="登録する" />
    </div>
  );
}
