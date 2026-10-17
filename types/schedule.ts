// 企業との違いは、フォームの値の型を別に持つこと

export const SCHEDULE_TYPES = [
  "面接",
  "説明会",
  "面談",
  "その他",
] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export type Schedule = {
  id: string;
  // YYYY-MM-DD
  date: string;
  // "09:30"形式なので文字列のまま大小を比べられる。なぜなら、必ず２桁で24時間表記だから。
  startTime: string;
  endTime: string;
  type: ScheduleType;
  // 企業IDは仕様書では任意だが、必須にした。なぜなら、企業のない予定を考えなくて済むからだ。合同説明会なども企業として登録する。
  companyId: string;
  // 中身が空の場合は""の1通りで表す。?は付けない。なぜなら、空の表し方が２通りになるからだ。？を使う場合に空はundefinedで表すが、これは保存も入力欄も扱えない。
  location: string;
  preparation: string;
  // 保存は配列、フォームでは改行入りの文字列になる。
  belongings: string[];
};

export type ScheduleInput = Omit<Schedule, "id">;

// 企業とは違い"belongings"はユーザーが入力した値をそのまま保存せずに、文字列の配列に変換して登録するため、変換する前のフォーム用の型を持っておく必要がある。
export type ScheduleFormValues = Omit<ScheduleInput, "belongings"> & {
  belongings: string;
};

export type ScheduleFormErrors = Partial<Record<keyof ScheduleFormValues, string>>;

