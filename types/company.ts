// 変数を大文字にしたのは固定のマスタデータだから。つまり、今後変わることのない変数だから。→環境変数も大文字の変数になってる
// ①companyで扱うデータの型を表現する際に、statusに関しては実際の値を型として使いたいからCOMPANY_STATUSESの変数で表している
export const COMPANY_STATUSES = [
  "応募済",
  "書類選考中",
  "一次面接",
  "二次面接",
  "最終面接",
  "内定",
  "お断り",
] as const;
// as constをつけることによって中身が文字列という型だけでなく、値までこれと指定している、readonlyになることにより書き換えを防ぐ

// ②ブラウザで実行時に使われるもの(COMPANY_STATUSES)を、ビルド時に使って消えるものとしても使いたいから、CompanyStatusでその型に変えてる
// typeofは値を受け取って、その型を返すもの、numberは配列の中身を数字で取り出せることを示す
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

// ③Companyではデータに当てはめる型、ビルド時に消える型として型をエクスポートしてる
export type Company = {
  id: string;
  name: string;
  position: string;
  appliedAt: string; // YYYY-MM-DD
  status: CompanyStatus;
  jobUrl: string;
  memo: string;
};
