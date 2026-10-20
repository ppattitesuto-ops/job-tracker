// ⭐️ここは予定のフォームを書くところ、使うページからPropsを受け取って表示する

import { SCHEDULE_TYPES } from "@/types/schedule";
import type { ScheduleFormValues, ScheduleInput, ScheduleType } from "@/types/schedule";
import Button from "./Button";
import { useState } from "react";
import { toScheduleInput, validateScheduleInput } from "@/lib/schedule";
import type { CompanyOption } from "@/types/company";

type Props = {
  // saveでは保存するデータを扱うためScheduleInputを型にする。initialDataではフォームでユーザーが入力した値を扱うためScheduleFormValuesを型にした。
  save: (data: ScheduleInput) => Promise<void>;
  submitLabel: string;
  // ユーザーが入力したフォームのデータ
  initialData: ScheduleFormValues;
  // 企業の一覧を選択肢として受け取る
  // CompanyOptionの型に[]をつけることで、CompanyOptionが並んだ配列ということを表すことができる。[]をつけなければ一社分しか表すことができずにmapで使えない
  companyOptions: CompanyOption[];
};

export default function ScheduleForm({ save, submitLabel, initialData, companyOptions }: Props) {

  const [formData, setFormData] = useState(initialData);
  // 送信中
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // 送信したかどうか(エラーを出していいかどうか)
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // 送信後
  const [hasSaved, setHasSaved] = useState(false);

  // toScheduleInputでフォームでの入力値を保存する形に変える
  const normalized = toScheduleInput(formData);
  // validateScheduleInputで保存する形を検査する
  const errors = validateScheduleInput(normalized);
  // 一度送信していたらエラーがあるなら内容を変数に入れる
  const fieldErrors = hasSubmitted ? errors : {};

  // 送信処理
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    // エラーがあれば送信を止める
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      // 登録ページと編集ページからsaveを受け取って通信
      await save(normalized);
      // 成功したらページ遷移中の二重送信を防ぐ
      setHasSaved(true);
    } catch {
      setSubmitError("データの保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // noValidateをつけることでブラウザの標準検査機能をオフにする。エラー表示は自分でつけたものに統一する
    <form noValidate onSubmit={handleSubmit}>
      <div>
        <label htmlFor="date">日付</label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          // aria-invalid:この欄は不正な状態だという表明
          aria-invalid={fieldErrors.date ? true : false}
          // aria-describedby:idで繋いだ文をスクリーンリーダーが読んでくれるようになる
          aria-describedby={fieldErrors.date ? "date-error" : undefined}
        />
        {fieldErrors.date && <p id="date-error">{fieldErrors.date}</p>}
      </div>
      <div>
        <label htmlFor="startTime">開始時刻</label>
        <input
          id="startTime"
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          aria-invalid={fieldErrors.startTime ? true : false}
          aria-describedby={fieldErrors.startTime ? "startTime-error" : undefined}
        />
        {fieldErrors.startTime && <p id="startTime-error">{fieldErrors.startTime}</p>}
      </div>
      <div>
        <label htmlFor="endTime">終了時刻</label>
        <input
          id="endTime"
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          aria-invalid={fieldErrors.endTime ? true : false}
          aria-describedby={fieldErrors.endTime ? "endTime-error" : undefined}
        />
        {fieldErrors.endTime && <p id="endTime-error">{fieldErrors.endTime}</p>}
      </div>
      <div>
        <label htmlFor="type">種別</label>
        <select
          id="type"
          value={formData.type}
          // 値がstringだと広いためScheduleTypeをつけて狭めた
          onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduleType })}
        >
          {SCHEDULE_TYPES.map((scheduleType) => (
            <option
              key={scheduleType}
              value={scheduleType}
            >
              {scheduleType}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="companyId">企業</label>
        <select
          id="companyId"
          value={formData.companyId}
          onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
          aria-invalid={fieldErrors.companyId ? true : false}
          aria-describedby={fieldErrors.companyId ? "companyId-error" : undefined}
        >
          <option value="">
            選択してください
          </option>
          {/* propsで受け取ったcompanyOptionsをmapで回しkeyとvalueには中身のidを表示はnameにする */}
          {companyOptions.map((companyOption) => (
            <option
              key={companyOption.id}
              value={companyOption.id}
            >
              {companyOption.name}
            </option>
          ))}
        </select>
        {fieldErrors.companyId && <p id="companyId-error">{fieldErrors.companyId}</p>}
      </div>
      <div>
        <label htmlFor="location">場所</label>
        <input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="preparation">準備すること</label>
        <textarea
          id="preparation"
          value={formData.preparation}
          onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="belongings">持ち物</label>
        {/* 最初に説明を書くことでやることがわかりやすい*/}
        <p id="belongings-hint">1行に1つずつ入力してください</p>
        <textarea
          id="belongings"
          value={formData.belongings}
          onChange={(e) => setFormData({ ...formData, belongings: e.target.value })}
          // 説明文とidを揃えてスクリーンリーダーに呼んでもらう
          aria-describedby="belongings-hint"
        />
      </div>
      {submitError && <div>{submitError}</div>}
      <Button variant="primary" type="submit" disabled={submitting || hasSaved}>{submitLabel}</Button>
    </form>
  );
}
