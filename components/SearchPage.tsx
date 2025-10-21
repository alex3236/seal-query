'use client';

import React from "react";
import { useRouter } from "next/navigation";
import SVGLogo from "@/components/Logo";
import Link from "next/link";

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
  timestamp,
  result,
  error
}: {
  timestamp?: string | null;
  result?: any | null;
  error?: string | null;
}) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const ts = formData.get('timestamp') as string;
    if (ts.trim()) {
      router.push(`/s/${ts.trim()}`);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 p-6">
      <div className="container mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">封箱贴查询</h1>

        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <label className="sr-only" htmlFor="timestamp">
            Timestamp
          </label>
          <input
            id="timestamp"
            name="timestamp"
            defaultValue={timestamp ?? ""}
            placeholder="请输入封箱贴编号"
            className="flex-1 border border-gray-200 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 rounded-xl"
          >
            查询
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800">
            <strong>错误：</strong> {error}
          </div>
        )}

        {result && (
          <div>
            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              查询到 <strong>{result.data?.total ?? "—"}</strong> 条记录
              {result.fromCache ? (
                <span className="text-xs text-indigo-600 dark:text-indigo-300 ml-2">(缓存)</span>
              ) : null}
            </div>

            {Array.isArray(result.data?.items) && result.data.items.length > 0 ? (
              <div className="space-y-4">
                {result.data.items.map((rec: any) => {
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
                          <div className="font-medium">{formatSealDate(Number(timestamp ?? "0") * 1000 )}</div>
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
      </div>
      <div className="flex items-center justify-center">
        <Link href="https://alex3236.moe"><SVGLogo className="mt-8 text-gray-400 dark:text-gray-600 fill-current w-40" /></Link>
      </div>
    </div>
  );
}