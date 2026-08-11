import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "就活管理トラッカー",
  description: "「応募状況の一元管理」と「面接の振り返りを次に活かす」ことを可能にしたアプリ。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
