import React from "react";
import SearchPage from "@/components/SearchPage";
import { fetchByTimestamp } from "@/lib/fetchBitable";
import { verifyCode } from "@/lib/codeVerification";

/**
 * Dynamic route handler for /s/[codeA]/[codeB]
 */
export default async function CodePage({ params }: {
  params: Promise<{ codeA: string, codeB: string[] }>
}) {
  const { codeA, codeB: codeBArray } = await params;
  const codeB = codeBArray?.[0] ?? null;
  let error: string | null = null;
  let res: any | null = null;

  do {
    if (!codeB) {
      break;
    }
    const { valid, timestamp } = verifyCode(codeA, codeB);

    if (!valid) {
      error = "验证码无效，请检查输入";
      break;
    }

    if (!timestamp) {
      error = "查询失败：时间戳无效";
      break;
    }

    res = await fetchByTimestamp(timestamp);

    if (res && (res as any).error) {
      error = (res as any).message ?? "查询失败：未知错误";
      break;
    }
  } while (false);

  console.log(res)


  return <SearchPage
    codeA={codeA}
    codeB={codeB}
    result={res}
    error={error}
  />;
}