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
        setSubmitError("Please enter a valid seal date and time");
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
        throw new Error(result.error || 'Add failed');
      }

      setSubmitSuccess("Record added successfully!");
      setCodes(makeCode(result.timestamp));

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error occurred while adding record');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-center">Add Record</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="Name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Item Name
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            value={formData.Name}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
            placeholder="Please enter item name"
          />
        </div>

        {/* Seal Date Time */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="SealDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Seal Time
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

        {/* Item Tracking Number */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="TrackingNum"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Item Tracking Number
          </label>
          <input
            type="text"
            id="TrackingNum"
            name="TrackingNum"
            value={formData.TrackingNum}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring rounded-xl"
            placeholder="Please enter item tracking number"
          />
        </div>

        {/* Item Type */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="Type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Item Type
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
            <option value="New">New</option>
            <option value="Old">Used</option>
          </select>
        </div>

        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Record Add Time
          </label>
          <input
            type="text"
            value={new Date(pageLoadTime).toLocaleString('en-US')}
            readOnly
            className="w-full border border-gray-300 dark:border-gray-400 rounded px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl"
          />
          <input
            type="hidden"
            name="pageLoadTime"
            value={pageLoadTime}
          />
        </div>

        {/* TOTP Verification */}
        <div className="rounded-xl px-4 pt-2 pb-3 border-3 border-gray-300 dark:border-gray-700">
          <label
            htmlFor="totp"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            TOTP Verification Code
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

        {/* Submit Button */}
        <div className="mt-2 flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-full"
          >
            Add Record
          </button>
        </div>
      </form>

      {
        submitError && (
          <div className="my-4 rounded-full border border-red-300 bg-red-50 p-3 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            <strong>Error:</strong> {submitError}
          </div>
        )
      }

      {submitSuccess && (
        <div className="my-4 flex items-center justify-between rounded-full border border-green-300 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 px-4 py-3">
          <div>
            <strong>Success:</strong> {submitSuccess}
          </div>
          <span>
            <a
              href={`/s/${codes.codeA}/${codes.codeB}`}
              className="text-blue-600 dark:text-blue-200 hover:underline mr-2"
            >
              View
            </a>
            <button
              onClick={() => window.open(`/print/${codes.codeA}/${codes.codeB}`, "_blank", "width=800,height=600")}
              className="text-blue-600 dark:text-blue-200 hover:underline cursor-pointer"
            >
              Print Seal Sticker
            </button>
          </span>
        </div>
      )
      }
    </>
  );
}