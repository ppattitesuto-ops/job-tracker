// ⭐️ここはボタンの種類に応じて色のついた部品を作るところ。

// ① 使う側で属性を指定する
// ② Button が props として受け取る（Reactが1つのオブジェクトにまとめる）
// ③ variant だけを取り出し、残りは rest に入る
// ④ variant から、対応表でクラス名を引く ←これのおかげで使う側はvariant="danger"と言葉を書けばそれに対応したクラスのボタンを作れる。
// ⑤ <button> が初めて作られる（④のクラス ＋ rest を渡す）

// ボタンのvariantを表す型を作る。
type ButtonVariant = "primary" | "secondary" | "dangerOutline" | "danger";
// Reactは使う側が書いた属性を一つのオブジェクトにまとめて渡す。(実行時)
// ComponentProps<"button">は受け取って良いものの一覧を決める型。(コンパイル時に働く)
// つまり、使う側で指定したボタンについている属性を全てpropsでオブジェクトとして受け取れる。→そこからvariantだけ取り出して下記にあるButtonコンポーネントで使う。
// Omitは第二引数にある文字列のキーを取り除く。(文字列のため、そのままでなく""引用符がいる)
// classNameは、ボタンのスタイリングを４種類に決め、余白はページ側で管理するため取り除いた。
// typeは、ボタンなら"button"、フォームの送信なら"submit"を必ず明示すると決めたので、React.ComponentProps<"button">のtypeは省略できるため取り除き、省略できない定義に差し替える。
type Props = Omit<React.ComponentProps<"button">, "type" | "className"> & {
  variant: ButtonVariant;
  type: "button" | "submit";
};

// 種類 → クラス名の対応表
const CLASS_BY_VARIANT: Record<ButtonVariant, string> = {
  "primary": "bg-blue-600 text-white",
  "secondary": "bg-white text-blue-600 border border-blue-600",
  "dangerOutline": "bg-white text-red-600 border border-red-600",
  "danger": "bg-red-600 text-white",
};

// ボタンの共通クラスをまとめた定数
const BASE_CLASSES = "py-2 px-4 text-sm font-bold disabled:opacity-50 enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black rounded-full shadow-black/30 shadow-md enabled:hover:opacity-80 motion-safe:enabled:active:translate-y-1 motion-safe:transition duration-300";

// { variant, ...rest }はvariantだけを自分で使い(Buttonでクラスの対応表に使う)、type/onClick/disabled/childrenなどはrestにまとめて{...rest}でこの部品の中で作る<button>要素にそのまま渡す。→variant(この部品の中で見た目を決めるためのもの)は<button>が知らない属性なので、渡すとHTMLに意味のない属性が出るため取り出す。
export default function Button({ variant, ...rest }: Props) {
  const colorClasses = CLASS_BY_VARIANT[variant];

  return <button className={`${BASE_CLASSES} ${colorClasses}`} {...rest} />;
}
