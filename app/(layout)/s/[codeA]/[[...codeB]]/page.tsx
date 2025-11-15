import React from "react";
import SearchPage from "@/components/SearchPage";
import { fetchByTimestamp } from "@/lib/bitableApi";
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
      error = "Invalid verification code, please check your input";
      break;
    }

    if (!timestamp) {
      error = "Query failed: Invalid timestamp";
      break;
    }

    res = await fetchByTimestamp(timestamp);

    if (res && (res as any).error) {
      error = (res as any).message ?? "Query failed: Unknown error";
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