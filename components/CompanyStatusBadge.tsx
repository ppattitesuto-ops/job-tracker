// ⭐️ここはステータスに応じて色の付いた部品を作るところ。

import type { CompanyStatus, CompanyStatusStage } from "@/types/company";
import { STAGE_BY_STATUS } from "@/types/company";

// ステータスをCompanyStatusの型で受け取る
type Props = {
  status: CompanyStatus;
};

// 段階を受け取ることで色がわかる表。
// Record<CompanyStatusStage, string>はこの表は中身がこうなっているという約束。ビルド時に消える。実行時には実際の表のみが残る。
const CLASS_BY_STAGE: Record<CompanyStatusStage, string> = {
  "screening": "bg-blue-100 text-blue-800",
  "interview": "bg-yellow-100 text-yellow-800",
  "offer": "bg-green-100 text-green-800",
  "rejection": "bg-gray-100 text-gray-800",
};

const BASE_CLASSES = "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";

export default function CompanyStatusBadge({ status }: Props) {
  // 変数にprops(ステータス)を受け取り対応する段階を入れる。
  const stage = STAGE_BY_STATUS[status];
  // 変数に段階を受け取り対応する色を入れる
  // 変数名は色のクラスがbgとtextで二つあるという意味
  const colorClasses = CLASS_BY_STAGE[stage];

  return (
    // spanを要素として選んだのはこの部品が文の流れの中に置かれる小さな札だから。(divだと前後で改行が入る)
    <span className={`${BASE_CLASSES} ${colorClasses}`}>{status}</span>
  );
}
