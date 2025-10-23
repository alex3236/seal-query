import "@/app/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  // 不引入上层 layout，直接返回 children
  return <html>
    <body>
      {children}
    </body>
  </html>
}