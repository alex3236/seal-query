import PrintPage from "@/components/TestPrintSeal";
import { notFound } from "next/navigation";

export const metadata = {
  title: "打印封箱贴",
}

export default function Page() {
  if (process.env.NODE_ENV !== "development") {
    console.error("Page is not available in production mode");
    return notFound();
  }
  return <PrintPage />
}