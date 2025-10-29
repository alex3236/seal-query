'use client';

import React from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const codeA = formData.get('codeA') as string;
    const codeB = formData.get('codeB') as string;

    if (codeA.trim()) {
      if (codeB.trim()) {
        router.push(`/s/${codeA.trim()}/${codeB.trim()}`);
      } else {
        router.push(`/s/${codeA.trim()}`);
      }
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-center">封箱贴查询</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="mx-auto max-w-fit w-full bg-white dark:bg-gray-800 rounded-2xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700 mb-2"
        >
          <div className="text-center">
            <label
              htmlFor="codeA"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              封箱贴编号
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

        {/* 下方“小卡片”：CodeB */}
        <div
          className="mx-auto max-w-fit bg-white dark:bg-gray-800 rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700 flex flex-col items-center mb-2"
        >
          <div className="w-full">
            <label
              htmlFor="codeB"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center"
            >
              校验码
            </label>

            <div className="flex justify-center">
              <InputOTP
                id="codeB"
                name="codeB"
                defaultValue={codeB ?? ""}
                length={5}
                charPattern={/[A-Za-z0-9]/}
                className="max-w-24"
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="mt-2 flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-full"
          >
            查询
          </button>
        </div>
      </form>

      {error && (
        <div className="my-4 rounded-full border border-red-300 bg-red-50 p-3 text-red-800">
          <strong>错误：</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 text-center">
            查询到 <strong>{result.data?.total ?? "—"}</strong> 条记录
            {result.fromCache ? (
              <span className="text-xs text-indigo-600 dark:text-indigo-300 ml-2">(缓存)</span>
            ) : null}
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
                        {fields.Type === "Old" ? "二手" : "全新"} | #{rec.record_id}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">物品名称</div>
                        <div className="font-medium">{name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">物流单号</div>
                        <div className="font-medium">{tracking}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">打印时间</div>
                        <div className="font-medium">{formatSealDate(fields.Timestamp)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">封箱时间</div>
                        <div className="font-medium">{formatSealDate(fields.SealDate)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">未找到任何记录。</div>
          )}
        </div>
      )}
    </>
  );
}