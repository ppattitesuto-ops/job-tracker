import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // nextVitalsは土台がNext.js・React・React Hooksのルール一式で、そのうちCore Web Vitals(表示性能)に影響するルールだけを警告からエラーに格上げしたもの。
  ...nextVitals,
  // nextTs は設定オブジェクトの配列。Next.jsが用意したTypeScript向けのルール一式。
  ...nextTs,
  // ルールを緩めた理由：{id, ...rest}でidを捨てるのは意図的な書き方であり、警告する意味がないから。nextTsの後に書くことで、順番からルールを自分用に上書きしている。
  {
    rules: {
      // "warn"：いまと同じseverityを保つ。"error"にするとnpm run lintが異常終了してそこで止まる。
      // severity:違反をどう扱うかの段階「"off"　0　検査しない」「"warn" 1 警告を出す。コマンドは成功する」「"error" 2 エラーを出す。コマンドは失敗する」
      // { ignoreRestSiblings: true }：rest(...)と一緒に分割された変数は、未使用でも警告しない
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
