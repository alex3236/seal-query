'use client';

import React, { useState, useEffect } from "react";
import InputOTP from "./InputOTP";
import { makeCode } from "@/lib/codeVerification";

export default function AddPage() {
  const [formData, setFormData] = useState({
    Name: "",
    SealDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    TrackingNum: "",
    Type: "New",
    totp: ""
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [pageLoadTime, setPageLoadTime] = useState(0);
  const [codes, setCodes] = useState<{ codeA: string | null, codeB: string | null }>({ codeA: null, codeB: null });

  useEffect(() => {
    setPageLoadTime(Date.now());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTOTPChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      totp: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const sealDateMs = new Date(formData.SealDate).getTime();

      if (isNaN(sealDateMs)) {
        setSubmitError("请输入有效的封箱日期和时间");
        return;
      }

      const submitData = {
        Name: formData.Name,
        SealDate: sealDateMs,
        Timestamp: pageLoadTime,
        TrackingNum: formData.TrackingNum,
        Type: formData.Type,
        totp: formData.totp
      };

      const response = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '添加失败');
      }

      setSubmitSuccess("记录添加成功！");
      setCodes(makeCode(result.timestamp));

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '添加记录时发生错误');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-center">添加记录</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 物品名称 */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="Name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            物品名称
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            value={formData.Name}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
            placeholder="请输入物品名称"
          />
        </div>

        {/* 封箱日期时间 */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="SealDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            封箱时间
          </label>
          <input
            type="datetime-local"
            id="SealDate"
            name="SealDate"
            value={formData.SealDate}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl dark:[color-scheme:dark]"
          />
        </div>

        {/* 物品追踪号 */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="TrackingNum"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            物品追踪号
          </label>
          <input
            type="text"
            id="TrackingNum"
            name="TrackingNum"
            value={formData.TrackingNum}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
            placeholder="请输入物品追踪号"
          />
        </div>

        {/* 物品类型 */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="Type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            物品类型
          </label>
          <select
            id="Type"
            name="Type"
            value={formData.Type}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white text-black
              dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="New">全新</option>
            <option value="Old">二手</option>
          </select>
        </div>

        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            记录添加时间
          </label>
          <input
            type="text"
            value={new Date(pageLoadTime).toLocaleString('zh-CN')}
            readOnly
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl"
          />
          <input
            type="hidden"
            name="pageLoadTime"
            value={pageLoadTime}
          />
        </div>

        {/* TOTP验证 */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="totp"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            TOTP 验证码
          </label>
          <div className="mx-auto max-w-xs">
            <InputOTP
              id="totp"
              name="totp"
              length={6}
              charPattern={/[0-9]/}
              onValueChange={handleTOTPChange}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="mt-2 flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-full"
          >
            添加记录
          </button>
        </div>
      </form>

      {
        submitError && (
          <div className="my-4 rounded-full border border-red-300 bg-red-50 p-3 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            <strong>错误：</strong> {submitError}
          </div>
        )
      }

      {submitSuccess && (
        <div className="my-4 flex items-center justify-between rounded-full border border-green-300 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 px-4 py-3">
          <div>
            <strong>成功：</strong> {submitSuccess}
          </div>
          <span>
            <a
              href={`/s/${codes.codeA}/${codes.codeB}`}
              className="text-blue-600 dark:text-blue-200 hover:underline mr-2"
            >
              查看
            </a>
            <a
              href={`/print/${codes.codeA}/${codes.codeB}`}
              className="text-blue-600 dark:text-blue-200 hover:underline"
            >
              打印封箱贴
            </a>
          </span>
        </div>
      )
      }
    </>
  );
}