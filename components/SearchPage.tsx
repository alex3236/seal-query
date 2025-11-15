'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import InputOTP from "./InputOTP";
import { BitableRecord } from "@/lib/bitableApi";

function formatSealDate(ms?: number | null) {
  if (ms == null) return "";
  try {
    const d = new Date(Number(ms));
    if (Number.isNaN(d.getTime())) return String(ms);

    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(ms);
  }
}

export default function SearchPage({
  codeA,
  codeB,
  result,
  error
}: {
  codeA?: string | null;
  codeB?: string | null;
  result?: any | null;
  error?: string | null;
}) {
  const router = useRouter();
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const codeA = formData.get('codeA') as string;
    const codeB = formData.get('codeB') as string;
    const currentRoute = window.location.pathname;
    let route = null;

    if (codeA.trim()) {
      if (codeB.trim()) {
        route = `/s/${codeA.trim()}/${codeB.trim()}`;
      } else {
        route = `/s/${codeA.trim()}`;
      }
    }

    if (route && route !== currentRoute) {
      setIsLoading(true);
      submitButtonRef.current?.setAttribute("disabled", "true");
      router.push(route);
    }
  };

  useEffect(() => {
    if (result && submitButtonRef.current) {
      setIsLoading(false);
      submitButtonRef.current.disabled = false;
    }
  }, [result])

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-center">Seal Sticker Query</h1>
      <form onSubmit={handleSubmit} className="space-y-6 border-3 border-gray-300 dark:border-gray-700 rounded-2xl w-fit mx-auto px-6 py-4">
        <div
          className="mx-auto max-w-fit w-full bg-white dark:bg-gray-800 px-4 pt-2 pb-3 mb-2"
        >
          <div className="text-center">
            <label
              htmlFor="codeA"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Seal Sticker Number
            </label>

            <div className="mx-auto max-w-54">
              <InputOTP
                id="codeA"
                name="codeA"
                defaultValue={codeA ?? ""}
                length={16}
                charPattern={/[0-9]/}
                separatorPositions={[4, 8, 12]}
              />
            </div>
          </div>
        </div>

        <div
          className="mx-auto max-w-fit bg-white dark:bg-gray-800 px-4 pt-2 pb-3 flex flex-col items-center mb-2"
        >
          <div className="w-full">
            <label
              htmlFor="codeB"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center"
            >
              Verification Code
            </label>

            <div className="flex justify-center">
              <InputOTP
                id="codeB"
                name="codeB"
                defaultValue={codeB ?? ""}
                length={5}
                charPattern={/[A-Z0-9]/}
                className="max-w-19"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-center">
          <button
            type="submit"
            ref={submitButtonRef}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-full disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {
              isLoading ?
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                : "Query"
            }
          </button>
        </div>
      </form>

      {error && (
        <div className="my-4 rounded-3xl border border-red-300 bg-red-50 p-3 text-red-800 text-center">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className={`mb-4 text-sm ${result.fromCache ? "text-indigo-600 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"} text-center`}>
            Found <strong>{result.data?.total ?? "—"}</strong> records
          </div>

          {Array.isArray(result.data?.items) && result.data.items.length > 0 ? (
            <div className="space-y-4">
              {result.data.items.map((rec: BitableRecord) => {
                const fields = rec.fields || {};
                const name = Array.isArray(fields.Name)
                  ? fields.Name.map((n: any) => n.text).join(", ")
                  : JSON.stringify(fields.Name);
                const tracking = Array.isArray(fields.TrackingNum)
                  ? fields.TrackingNum.map((t: any) => t.text).join(", ")
                  : JSON.stringify(fields.TrackingNum);
                return (
                  <div key={rec.record_id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700 font-mono">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <span className={`text-xs border px-2 py-1 rounded-full 
                          ${fields.Type === "Old" ?
                          "text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
                          : "text-green-700 dark:text-green-300 border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/30"
                        }`}>
                        {fields.Type === "Old" ? "Used" : "New"} | #{rec.record_id}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">Item Name</div>
                        <div className="font-medium">{name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">Tracking Number</div>
                        <div className="font-medium">{tracking}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">Print Time</div>
                        <div className="font-medium">{formatSealDate(fields.Timestamp)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">Seal Time</div>
                        <div className="font-medium">{formatSealDate(fields.SealDate)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">No records found.</div>
          )}
        </div>
      )}
    </>
  );
}