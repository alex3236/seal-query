"use client";

import { useEffect } from "react";
import SealSticker from "@/components/SealSticker";

export default function PrintSealSticker({ codeA, codeB }: {
    codeA: string;
    codeB: string;
}) {
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
    });

    const APP_URL = process.env.APP_URL?.replace(/\/$/, "") || "";


    const qrValue = `${APP_URL}/s/${codeA}`;
    const serialLines: [string, string] = [
        codeA.slice(0, 4) + ' ' + codeA.slice(4, 8),
        codeA.slice(8, 12) + ' ' + codeA.slice(12, 16),
    ]

    return <div>
        <SealSticker qrValue={qrValue} serialLines={serialLines} badge={codeB} />
    </div>
}