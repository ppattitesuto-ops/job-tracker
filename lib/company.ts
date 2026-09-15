// ⭐️企業のデータを調べて、作り変える
import type { CompanyInput, CompanyInputErrors } from "@/types/company";
import { isHttpUrl } from "@/lib/validation";

// dataは書き換えずにtrim()で空白をカットした値を新しいオブジェクトに入れてる
// appliedAtとstatusは空文字にならないためなし(appliedAtはtype="date",statusはCompanyStatusの決められた７つの語)
// 調べる(validateCompanyInput)と作り替える(normalizeCompanyInput)を分けている→正規化はhandleSubmitで一回だけ行い、検証と保存に同じ値を渡している。
export function normalizeCompanyInput(data: CompanyInput): CompanyInput {
  return {   //javascriptのオブジェクトリテラル(新しいオブジェクトを作る記法)
    ...data,
    name: data.name.trim(),
    position: data.position.trim(),
    jobUrl: data.jobUrl.trim(),
    memo: data.memo.trim(),
  };
}

// 問題:①入力エラーの型を作る場合に今あるCompanyInputを使った方が今後データを追加する場合にも保守性が高い。しかし、statusは値が７つの語と決められているためエラーメッセージが入らない。②空文字のエラーメッセージがあると{fieldErrors.name && <p>…</p>}(登録ページ)などでエラーメッセージを描画するコードにおいて何も表示されず、ボタンを押してもif (Object.keys(errors).length > 0) return;(登録ページ)で送信が止められているため何も起きない。しかし、何も表示されないため原因を辿れない状況になる。そこで、companyInputErrorsのPartialはキーが無くても良いと許可をしている。
// validateCompanyInput:{}から始めて駄目だった項目だけキーを生やして値と共に返す。→CompanyInputを受け取ってCompanyInputErrorsを返す関数。
// どこがダメかを検証する関数、登録の送信を止めるかどうか判断するのはhandleSubmit
export function validateCompanyInput(data: CompanyInput): CompanyInputErrors {
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
