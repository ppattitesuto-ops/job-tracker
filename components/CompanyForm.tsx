// ⭐️ここはフォームを書くところ、使うページからPropsを受け取って表示する

import { normalizeCompanyInput, validateCompanyInput } from "@/lib/company";
import { COMPANY_STATUSES } from "@/types/company";
import type { CompanyStatus, CompanyInput } from "@/types/company";
import { useState } from "react";

// ページ側からこの型宣言を見ると「守るべき約束」を表している。あくまで約束。実際の型検査はページ側でコンパイル時(typecheck や build のときに検査される)に行われる。
// 型の名前は変数名と間違えるのを防止するため大文字でスタート
type Props = {
  save: (data: CompanyInput) => Promise<void>;
  submitLabel: string;
  initialData: CompanyInput;
};

// CompanyForm関数の引数としてprops(オブジェクト)を受け取ることで、上で宣言したProps(型)がprops(オブジェクト)と結び付けられ約束として働き始める。
// リアクトはpropsを一つのオブジェクトにまとめて第一引数として渡す。そして、ここでは受け取ったオブジェクトを分割代入({ save, submitLabel, initialData })で3つの変数に取り出している。
export default function CompanyForm({ save, submitLabel, initialData }: Props) {

  // ⭐️PropsでinitialDataをCompanyInputと宣言しているので、useStateがそこから型を推論する。だから型引数は要らない。その宣言が本当であることは、ページが渡すときの検査が保証する。
  const [formData, setFormData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);
  // 送信の失敗：Firestoreが返事をくれて初めて分かる
  const [submitError, setSubmitError] = useState("");
  // 初めはfalseでエラーの表示を禁止する。一度送信が行われたらtrueにしてエラーがある場合は表示をする。
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // submittingだけでは通信中の二重送信は守れても、通信が成功した後のページ遷移中の間にボタンが押せるようになる二重送信は守れない。保存済みというもう一つのstateを持つことでページ遷移中にもボタンが押せなくなるようにして二重送信を防ぐ。
  const [hasSaved, setHasSaved] = useState(false);

  // 正規化(空白をtrim()された値)されたformDataの値を返している
  const normalized = normalizeCompanyInput(formData);
  // validateCompanyInputで検証した結果、エラーがある項目を返している
  const errors = validateCompanyInput(normalized);
  // 入力の検証エラー：どの項目が、なぜ駄目か(送信をする前はエラーがあっても表示しない)
  const fieldErrors = hasSubmitted ? errors : {};

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // エラーの有無に関わらず一度送信が行われた場合にエラーがある場合は内容を表示できるようにする
    setHasSubmitted(true);
    // errorsのオブジェクトに入っているキーの数が0よりも大きかったら送信処理を行わない。
    if (Object.keys(errors).length > 0) return;
    // 送信ボタンの二度押しを防止
    setSubmitting(true);
    setSubmitError("");
    try {
      // awaitなし：save()が呼ばれ、まだ保存が終わっていないPromiseが返る。finallyがすぐ動く、ボタンが押せるようになる。通信がそのあとで失敗する。→でもtryは終わっているからcatchに届かずエラーが画面に出ない。
      // awaitあり：awaitのところで待つ。保存が失敗するとawaitの場所で例外として投げられ、catchが受け取る→エラーが表示される。その後にfinallyが動く。
      await save(normalized);
      // このフォームは『保存に成功したらページを離れる』使い方を前提にしている。→hasSavedがtrueになることで送信ボタンが押せなくなる。ここでページ遷移中の二重送信をカバーする。hasSavedをfalseにするコードはいらない。なぜなら別のページに遷移することでこのページに次に来たときにstateが初期値のfalseになり再び送信ボタンが押せるようになるから。逆に通信が失敗した場合でも上のsave(normalized)からsetHasSaved(true);を通らずにcatchに落ちてfinallyでsetSubmittingがfalseになることで再び送信ボタンは押せるようになる。
      setHasSaved(true);
    } catch {
      setSubmitError("データの保存に失敗しました");
    } finally {
      // 通信が失敗した時にやり直せるように戻す
      setSubmitting(false);
    }
  };

  return (
    // formで囲う理由には①Enterキーで送信できる点②type="url"の形式検証はフォームの送信時に働くから。→②：今回はエラー表示を画面内に統一するためブラウザの標準機能は動かない。
    // 本来の仕様書ではブラウザの形式検証を使うと明示的に書いてあったが、今回は使わずに別の方法で目的を実現した。→目的：スキーマ欠落したURLが保存されるのを防ぐ。→別の方法：validateCompanyInput関数ではlib/validation.tsからisHttpUrl関数を呼んでそのURLのprotocolがhttp:かhttps:かを判定することでスキーマ欠落したURLがデータとして保存されるようならエラーを出すようにした。
    // noValidateはブラウザ標準のフォーム検証をオフにする属性。
    <form noValidate onSubmit={handleSubmit}>
      <div>
        {/* labelについているhtmlForは他の要素のidと対応させることでスクリーンリーダー(画面の内容を音声で読み上げるソフト)に対応できる。 */}
        <label htmlFor="name">企業名</label>
        <input
          id="name"
          type="text"
          placeholder="企業名を入力してください"
          value={formData.name}
          // ⭐️⭐️⭐️スプレッド構文で新しいオブジェクトが作られ、リアクトが変更を検知できるようになる理由はメモリ上の別の場所を指すようになるから
          // e.target.valueは、DOMが必ず文字列で返す。ここが実行時に文字列を作る仕組みになっている。
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          // aria-invalid:この欄は不正な状態だという表明
          aria-invalid={fieldErrors.name ? true : false}
          // aria-describedby:その説明(エラー文)が書いてある要素(ここでは下にある<p>文を指す。このIDを要素のIDと対応させることで、スクリーンリーダーが入力欄の後にエラー文も続けて読んでくれる
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
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
          value={formData.appliedAt}
          // onChangeで全体を囲っている{}はJSXの記法(属性に「式」を渡す)
          // setFormData()の中にある{}はただのオブジェクトを作るというJavaScriptの書き方。
          onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
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
          value={formData.status}
          // asはtypescriptよりも自分の方がその返り値が何になるかを知っている場合に宣言するもの。これの場合typescriptは返ってくる値は広い定義としてstringと知っている、しかし、自分はそれよりも狭い型としてCompanyStatusの値のどれかで返ってくると知っているからasで宣言している。
          onChange={(e) => setFormData({ ...formData, status: e.target.value as CompanyStatus })}
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
          value={formData.jobUrl}
          onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
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
          value={formData.memo}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
        />
      </div>
      {submitError && <div>{submitError}</div>}
      {/* buttonの規定値は元々submitだがtype="submit"と明示することで送信処理はこのボタンの内容が行われるんだとわかりやすくなる。 */}
      {/* disabledはsubmitting(保存中に押せなくする)とhasSaved(通信が成功した後のページ遷移中に押せなくする)で管理して二度押しを防止する */}
      {/* submitLabelは登録・編集フォームからPropsを受け取っている */}
      <button type="submit" disabled={submitting || hasSaved}>{submitLabel}</button>
    </form>
  );
}
