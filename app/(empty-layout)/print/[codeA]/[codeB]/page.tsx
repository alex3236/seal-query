import PrintSealSticker from "@/components/PrintSeal";
import { verifyCode } from "@/lib/codeVerification";
import { redirect } from "next/navigation";
import { Usable, use } from "react";

export default function PrintPage({ params }: {
  params: Usable<{ codeA: string; codeB: string }>
}) {
  const p = use(params);

  if (!process.env.APP_URL) {
    console.error("APP_URL is not set");
    redirect("/");
  }
  if (p.codeA.length !== 16 || p.codeB.length !== 5) {
    redirect(`/print`);
  }
  const { valid } = verifyCode(p.codeA, p.codeB);
  if (!valid) {
    redirect(`/print`);
  }

  return <PrintSealSticker codeA={p.codeA} codeB={p.codeB} />
}
