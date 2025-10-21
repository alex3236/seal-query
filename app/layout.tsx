import "./globals.css";
import React from "react";

export const metadata = {
  title: "封箱贴查询",
  description: "查询 Alex3236.moe 封箱贴"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}