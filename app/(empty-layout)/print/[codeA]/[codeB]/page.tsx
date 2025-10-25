"use client";

import SealSticker from "@/components/SealSticker";
import assert from "node:assert";
import { Usable, use, useEffect } from "react";

export default function PrintSealSticker({ params }: {
  params: Usable<{ codeA: string; codeB: string }>
}) {
  const p = use(params);
  assert(p.codeA.length === 16, "codeA length must be 16");
  assert(p.codeB.length === 5, "codeB length must be 5");
  const codeA = p.codeA;
  const codeB = p.codeB;
  const qrValue = `https://seal.alex3236.moe/s/${codeA}`;
  const serialLines: [string, string] = [
    codeA.slice(0, 4) + ' ' + codeA.slice(4, 8),
    codeA.slice(8, 12) + ' ' + codeA.slice(12, 16),
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    const handlePrintAfter = () => {
      window.close();
    };

    window.addEventListener('afterprint', handlePrintAfter);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handlePrintAfter);
    };
  }, []);

  return <div>
    <SealSticker qrValue={qrValue} serialLines={serialLines} badge={codeB} />
  </div>
}