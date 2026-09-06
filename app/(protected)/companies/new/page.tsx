"use client";

import { useAuth } from "@/contexts/AuthContext";
import { addCompany } from "@/lib/firestore";
import { isHttpUrl } from "@/lib/validation";
import type { CompanyInput, CompanyStatus } from "@/types/company";
import { COMPANY_STATUSES } from "@/types/company";
import { useRouter } from "next/navigation";
import { useState } from "react";

// dataは書き換えずにtrim()で空白をカットした値を新しいオブジェクトに入れてる
// appliedAtとstatusは空文字にならないためなし(appliedAtはtype="date",statusはCompanyStatusの決められた７つの語)
// 調べる(validateCompanyInput)と作り替える(normalizeCompanyInput)を分けている→正規化はhandleSubmitで一回だけ行い検証と保存に同じ値を渡している。
function normalizeCompanyInput(data: CompanyInput): CompanyInput {
  return {   //javascriptのオブジェクトリテラル(新しいオブジェクトを作る記法)
    ...data,
    name: data.name.trim(),
    position: data.position.trim(),
    jobUrl: data.jobUrl.trim(),
    memo: data.memo.trim(),
  };
}

// 問題:①入力エラーの型を作る場合に今あるCompanyInputを使った方が今後データを追加する場合にも保守性が高い。しかし、statusは値が７つの語と決められているためエラーメッセージが入らない。②空文字のエラーメッセージがあると{fieldErrors.name && <p>…</p>}などでエラーメッセージを描画するコードにおいて何も表示されず、ボタンを押してもif (Object.keys(errors).length > 0) return;で送信が止められているため何も起きない。しかし、何も表示されないため原因を辿れない状況になる。そこで、Partialはキーが無くても良いと許可をしている。
// keyof CompanyInput:CompanyInputからキーだけを取り出すためのもの
// Record：キーの集合と値の型からオブジェクト型を組み立てる。→Record<keyof CompanyInput, string>でCompanyInputのキーを取り出し、値をstringにしてオブジェクトを作る。→statusも値がstringになったことでエラーメッセージが入れられるようになった。
// Partial<T>:すべてのプロパティを省略可能にする(これがないと6項目全てに文字列を入れないと型が通らない)→Partialで{}から始められるようにしてあとからエラーメッセージがあるものを項目として生やしていく設計になっている。
type CompanyInputErrors = Partial<Record<keyof CompanyInput, string>>;
// validateCompanyInput:{}から始めて駄目だった項目だけキーを生やして値と共に返す。→CompanyInputを受け取ってCompanyInputErrorsを返す関数。
// どこがダメかを検証する関数、登録の送信を止めるかどうか判断するのはhandleSubmit
function validateCompanyInput(data: CompanyInput): CompanyInputErrors {
  // errorsという変数を型にはめて、エラーメッセージを受け取る土台を作る
  const errors: CompanyInputErrors = {};
  // この .trim() は、正規化済みの値が渡る通常経路では何も変えない。
  // それでも残すのは、「正規化済みで渡すこと」を型で表現できず、通し忘れを機械が検出できないため。⭐️⭐️
  // nameは前後に空白が入りうるからtrim()を使う。
  if (data.name.trim() === "") {
    errors.name = "企業名が入力されていません";
  }
  if (data.position.trim() === "") {
    errors.position = "職種が入力されていません";
  }
  // appliedAtはtype="date"なので入りえないからtrim()を使わない。
  if (data.appliedAt === "") {
    errors.appliedAt = "応募日が入力されていません";
  }
  // !==(厳密不等価):型も値も同じでなければtrue。
  // 求人票のURLが手元にないまま企業を登録する場面はあるため、空文字にはエラーメッセージを出さない。→このif文がもしなかったら、本来検査の対象じゃない空文字で入力された場合に意図してないエラーメッセージが表示される。
  if (data.jobUrl.trim() !== "" && !isHttpUrl(data.jobUrl)) {
    // 本来は解析が成功したとしてもprotocolがhttp:かhttps:でなかった場合は「http/httpsではありません」とエラーを出し、解析が失敗した場合は「形式が壊れています」とエラーを出す形だったが、結局ユーザーが取るアクションとしてはもう一度URLを入力することなので二つに分けずにエラーメッセージを一つに統一した。
    errors.jobUrl = "'http://'か'https://' で始まる URL を入力してください";
  }
  return errors;
}

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
  // CompanyInput：ID以外の要素を指定(登録の際にはまだIDはないため)
  // 6項目の値をオブジェクトのuseStateで管理する
  const [newData, setNewData] = useState<CompanyInput>({
    name: "",
    position: "",
    // 登録する時が応募日になることが多いため初期値は当日、コンポーネントが描画されるたびに初期値が渡されるがuseStateによって毎回捨てられる。描画のたびに渡される初期値を追随していたらユーザーが入力した値に更新されないから。もし自分でstateを変えたならその値が入る。
    appliedAt: todayString(),
    status: "応募済",
    jobUrl: "",
    memo: "",
  });
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  // 送信の失敗：Firestoreが返事をくれて初めて分かる
  const [submitError, setSubmitError] = useState("");
  // 初めはfalseでエラーの表示を禁止する。一度送信が行われたらtrueにしてエラーがある場合は表示をする。
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 正規化(空白をtrim()された値)されたnewDataの値を返している
  const normalized = normalizeCompanyInput(newData);
  // validateCompanyInputで検証した結果、エラーがある項目を返している
  const errors = validateCompanyInput(normalized);
  // 入力の検証エラー：どの項目が、なぜ駄目か(送信をする前はエラーがあっても表示しない)
  const fieldErrors = hasSubmitted ? errors : {};

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ここでユーザーがnullの時を消しておかないと、下の処理でuserを使う時にnullの可能性があり、コンパイル時に弾かれる
    if (!user) return;
    // エラーの有無に関わらず一度送信が行われた場合にエラーがある場合は内容を表示できるようにする
    setHasSubmitted(true);
    // errorsのオブジェクトに入っているキーの数が0よりも大きかったら登録処理を行わない。
    if (Object.keys(errors).length > 0) return;
    // 登録ボタンの二度押しを防止
    setSubmitting(true);
    setSubmitError("");
    try {
      await addCompany(user.uid, normalized);
      // データの登録が成功したときにページを遷移させたいからここにおく
      router.push("/companies");
    } catch {
      setSubmitError("企業の登録に失敗しました");
    } finally {
      // 両方の処理後にsetSubmittingの真偽値をfalseにすることで登録ボタンのdisabled属性を使って再びボタンが押せるようにする
      setSubmitting(false);
    }
  };

  return (
    // formで囲う理由には①Enterキーで送信できる点②type="url"の形式検証はフォームの送信時に働くから。→②：今回はエラー表示を画面内に統一するためブラウザの標準機能は動かない。
    // 本来の仕様書ではブラウザの形式検証を使うと明示的に書いてあったが、今回は使わずに別の方法で目的を実現した。→目的：スキーマ欠落したURLが保存されるのを防ぐ。→別の方法：validateCompanyInput関数ではlib/validation.tsからisHttpUrl関数を呼んでそのURLのprotocolがhttp:かhttps:かを判定することでスキーマ欠落したURLがデータとして保存されるようならエラーを出すようにした。
    <form noValidate onSubmit={handleSubmit}>
      <h1>登録フォーム</h1>
      <div>
        {/* labelについているhtmlForは他の要素のidと対応させることでスクリーンリーダー(画面の内容を音声で読み上げるソフト)に対応できる。 */}
        <label htmlFor="name">企業名</label>
        <input
          id="name"
          type="text"
          placeholder="企業名を入力してください"
          value={newData.name}
          // ⭐️⭐️⭐️スプレッド構文で新しいオブジェクトが作られ、リアクトが変更を検知できるようになる理由はメモリ上の別の場所を指すようになるから
          onChange={(e) => setNewData({ ...newData, name: e.target.value })}
          // aria-invalid:この欄は不正な状態だという表明
          aria-invalid={fieldErrors.name ? true : false}
          // aria-describedby:エラー文のidを指す。これをlabelと対応させることで、スクリーンリーダーが入力欄の後にエラー文も続けて読んでくれる
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
        />
        {fieldErrors.name && <p id="name-error">{fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="position">職種</label>
        <input
          id="position"
          type="text"
          placeholder="職種を入力してください"
          value={newData.position}
          onChange={(e) => setNewData({ ...newData, position: e.target.value })}
          aria-invalid={fieldErrors.position ? true : false}
          aria-describedby={fieldErrors.position ? "position-error" : undefined}
        />
        {fieldErrors.position && <p id="position-error">{fieldErrors.position}</p>}
      </div>
      <div>
        <label htmlFor="appliedAt">応募日</label>
        <input
          id="appliedAt"
          type="date"
          value={newData.appliedAt}
          // onChangeで全体を囲っている{}はJSXの記法(属性に「式」を渡す)
          // setNewData()の中にある{}はただのオブジェクトを作るというJavaScriptの書き方。
          onChange={(e) => setNewData({ ...newData, appliedAt: e.target.value })}
          aria-invalid={fieldErrors.appliedAt ? true : false}
          aria-describedby={fieldErrors.appliedAt ? "appliedAt-error" : undefined}
        />
        {fieldErrors.appliedAt && <p id="appliedAt-error">{fieldErrors.appliedAt}</p>}
      </div>
      <div>
        {/* statusはエラーの検証がいらない→status:selectで７語のどれかしか入らず、間違った入力ができない。*/}
        <label htmlFor="status">選考ステータス</label>
        <select
          id="status"
          value={newData.status}
          // asはtypescriptよりも自分の方がその返り値が何になるかを知っている場合に宣言するもの。これの場合typescriptは返ってくる値は広い定義としてstringと知っている、しかし、自分はそれよりも狭い型としてCompanyStatusの値のどれかで返ってくると知っているからasで宣言している。
          onChange={(e) => setNewData({ ...newData, status: e.target.value as CompanyStatus })}
        >
          {/* mapでoptionを回す理由は今後statusの要素が増えたとしても、新たにコードをたさなくてもいいから。*/}
          {COMPANY_STATUSES.map((companyStatus) => (
            // optionのvalueは機械にわたす値を書く→ここにはcompanyStatusと書くことにより、機械がこの値を受け取れるようになる。※一応　valueはなくても表示に{companyStatus}があるから動くが、本来はvalueと表示は別の概念なのでここでは分ける。将来保存する値(value)を英語コード("applied")にして、表示は日本語のままにするときにどこを変えればいいか分かるようにしておく。今回は自分が使い、期間も就活期間と短い。その上今後表記が変わる見込みも薄いので、時間がかからない両方とも日本語で管理する方法を採用。
            // 中身の{companyStatus}は人間が見るもの
            <option
              key={companyStatus}
              value={companyStatus}
            >
              {companyStatus}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="jobUrl">求人URL</label>
        <input
          id="jobUrl"
          // typeをurlにすることで送信ボタンを押した際にブラウザの標準検証が作動するようになる。中身が絶対にURLの形式かどうかを見る。実在するURLかどうかまでは見ない。あくまで形式だけ。→今回はエラー表示を画面内に統一するためブラウザの標準機能は動かない。
          // type="url"を残している理由:①スマートフォンのキーボードがURL向けに変わる②過去に入力したURLが候補に出やすくなる③コードを読む人への表明ができる、ここはURLを入れる欄だ。
          type="url"
          placeholder="求人URLを入力してください"
          value={newData.jobUrl}
          onChange={(e) => setNewData({ ...newData, jobUrl: e.target.value })}
          aria-invalid={fieldErrors.jobUrl ? true : false}
          aria-describedby={fieldErrors.jobUrl ? "jobUrl-error" : undefined}
        />
        {fieldErrors.jobUrl && <p id="jobUrl-error">{fieldErrors.jobUrl}</p>}
      </div>
      <div>
        {/* memoはエラーの検証がいらない→memo:任意項目で形式の制約が無い。何を書いても正しい*/}
        {/* 将来メモに文字数制限などの検証がつけばエラーメッセージを導入する可能性もある */}
        <label htmlFor="memo">メモ</label>
        <textarea
          id="memo"
          value={newData.memo}
          onChange={(e) => setNewData({ ...newData, memo: e.target.value })}
        />
      </div>
      {submitError && <div>{submitError}</div>}
      {/* buttonの規定値は元々submitだがtype="submit"と明示することで送信処理はこのボタンの内容が行われるんだとわかりやすくなる。 */}
      {/* disabledはsubmittingで管理して二度押しを防止する */}
      <button type="submit" disabled={submitting}>登録する</button>
    </form>
  )
}
