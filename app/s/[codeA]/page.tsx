import React from "react";
import SearchPage from "@/components/SearchPage";
import { fetchByTimestamp } from "@/lib/fetchBitable";
import { verifyCode } from "@/lib/codeVerification";

/**
 * Dynamic route handler for /s/[codeA]?v=[codeB]
 */
export default async function CodePage({ params, searchParams }: { 
  params:  Promise<{ codeA: string }>,
  searchParams: Promise<{ v?: string }>
}) {
  const codeA = (await params).codeA;
  const codeB = (await searchParams).v;
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

    res = timestamp ? await fetchByTimestamp(timestamp) : null;

    if (res && (res as any).error) {
      error = (res as any).message ?? "查询失败：未知错误";
      break;
    }
  } while (false);
  

  return <SearchPage 
    codeA={codeA} 
    codeB={codeB}
    result={res} 
    error={error} 
  />;
}