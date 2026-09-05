"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getCompany, updateCompanyStatus } from "@/lib/firestore";
import { isHttpUrl } from "@/lib/validation";
import { COMPANY_STATUSES } from "@/types/company";
import type { Company, CompanyStatus } from "@/types/company";
import Link from "next/link";
// useParams(クライアントコンポーネントでしか使えない)は、今のURLの動的な部分を取るためのフック。返り値：{id: 123}などのオブジェクトになる。値の型：string | string[] | undefined
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyPage() {

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { user } = useAuth();
  // paramsには今のURLのIDがオブジェクトとして入っている
  const params = useParams();
  // このファイルは[id]の中にあるから実行時にparams.idは必ずstringになる。だから、asでparams.idはstringと宣言している。[...slug]のルートから呼ばれることがない(string[]の経路)
  const paramsId = params.id as string;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setError("");
      try {
        setCompany(await getCompany(user.uid, paramsId));
      } catch {
        setError("企業の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, paramsId]);

  // eはイベントオブジェクトを表す。handleSelectが置かれたイベントを受け取る。→e.target.valueでe(イベント全体)target(イベントが起きた要素、今回は<select>)value(その要素の現在の値、optionで選ばれた値)
  // React.ChangeEventはReactが用意しているイベントの型(formならReact.SubmitEvent)
  // <HTMLSelectElement>はselect要素のchangeイベントだと示している。
  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user || !company) return;
    // <HTMLSelectElement>によってvalueがstringの型になっている。COMPANY_STATUSESで値を回しているためここに来るのは必ずCompanyStatusになる。だから、asで明示的に示している
    // selectで選んだ値をこの関数の引数でイベントとして受け取ってそれをnewStatusに入れている
    const newStatus = e.target.value as CompanyStatus;
    setSubmitError("");
    setSubmitting(true);
    try {
      // Firestoreへの値の変更を送信する
      await updateCompanyStatus(user.uid, paramsId, newStatus);
      // Firestoreの値は変わったが、データを取ってきているわけではないので画面は変わらない。setCompanyでstatusの値を変える。
      setCompany({ ...company, status: newStatus });
    } catch {
      setSubmitError("選考ステータスの変更に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>読み込み中</div>;
  if (error) return <div>{error}</div>;
  if (!company) return (
    <div>
      {/* もう一度お試しくださいではなく、見つかりませんにした理由は、このIDが自分の配下に存在しないIDだと知らせるため。 */}
      <div>見つかりません</div>
      <Link href="/companies">一覧ページへ戻る</Link>
    </div>
  );

  // 求人URLで表示する文を条件分岐して、jobUrlContentに入れてreturnで表示する。
  // 変数を宣言する時点では中身が決められないからletで定義する。→constの場合は宣言と同時に値を入れる必要がある。
  let jobUrlContent;
  // URLが空文字の場合を条件分岐(trim()で空白を無くすことで、URLに空白が入力されていた場合にそのまま下の条件分岐をスルーして次に進むのを回避する。→その場合はisHttpUrlのnew URLの解析で弾かれて本来の原因とは違うエラーメッセージが出てしまう。)
  if (company.jobUrl.trim() === "") {
    jobUrlContent = <span>URLが登録されていません</span>;
  } else if (!isHttpUrl(company.jobUrl)) {
    jobUrlContent = <span>不正なURLです。編集ページでURLを入れ直してください</span>;
  } else {
    jobUrlContent = <a href={company.jobUrl} target="_blank" rel="noopener noreferrer">{company.jobUrl}</a>;
  }

  return (
    <div>
      <h1>企業情報の詳細</h1>
      {/* 詳細ページなので各項目を説明リスト（項目名とその説明）で表す */}
      <dl>
        <dt>企業名</dt>
        <dd>{company.name}</dd>

        <dt>職種</dt>
        <dd>{company.position}</dd>

        <dt>応募日</dt>
        <dd>{company.appliedAt}</dd>

        <dt>
          <label htmlFor="status">選考ステータス</label>
        </dt>
        <dd>
          <select
            id="status"
            value={company.status}
            onChange={handleSelect}
            // selectにdisabledをつけることで選択肢をそもそも触れなくする
            disabled={submitting}
          >
            {COMPANY_STATUSES.map((companyStatus) => (
              <option
                key={companyStatus}
                value={companyStatus}
              >
                {companyStatus}
              </option>
            ))}
          </select>
          {/* 送信が失敗した場合にsetSubmitErrorを使ってselectの下にエラーを表示 */}
          {submitError && <div>{submitError}</div>}
        </dd>

        <dt>求人URL</dt>
        <dd>{jobUrlContent}</dd>

        <dt>メモ</dt>
        <dd>{company.memo}</dd>
      </dl>
    </div>
  );
}
