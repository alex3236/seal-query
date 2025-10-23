"use client";
import InputOTP from "@/components/InputOTP";
import { makeCode } from "@/lib/codeVerification";
import { useState, useEffect } from "react";

export default function PrintPage() {
  const [codes, setCodes] = useState({ timestamp: 0, codeA: '', codeB: '' });

  useEffect(() => {
    // Generate new codes when component mounts
    const timestampSec = Math.floor(Date.now() / 1000);
    const { codeA, codeB } = makeCode(timestampSec);
    setCodes({ timestamp: timestampSec, codeA, codeB });
    console.log(timestampSec, codeA, codeB);
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-center">封箱贴打印</h1>
      <p className="text-sm text-gray-400 dark:text-gray-300 text-center mb-4">
        {new Date(codes.timestamp * 1000).toLocaleString()} ({codes.timestamp})
      </p>
      <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const codeA = formData.get("codeA") as string;
        const codeB = formData.get("codeB") as string;
        if (!codeA || !codeB) {
          alert("请输入完整的封箱编号和验证码");
          return;
        }
        console.log(codeA, codeB);
        // print in new seprate window
        window.open(`/print/${codeA}/${codeB}`, "_blank", "width=800,height=600");
      }}>
        <div className="mb-4">
          <label htmlFor="boxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            封箱编号
          </label>
          <InputOTP
            id="codeA"
            name="codeA"
            className="mb-4"
            value={codes.codeA}
            length={16}
            charPattern={/[0-9]/}
            separatorPositions={[4, 8, 12]}
          />
          <label htmlFor="codeB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            验证码
          </label>
          <InputOTP
            id="codeB"
            name="codeB"
            className="mb-4"
            value={codes.codeB}
            length={5}
            charPattern={/[a-zA-Z0-9]/}
          />
          <input
            type="submit"
            value="打印"
            className="block mx-auto p-2 bg-blue-500 text-white rounded-full px-4 py-1 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      </form>
    </>
  );
}