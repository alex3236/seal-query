import React from "react";
import SearchPage from "@/components/SearchPage";
import { fetchByTimestamp } from "@/lib/fetchBitable";

/**
 * Dynamic route handler for /s/[timestamp]
 */
export default async function TimestampPage({ params }: { params: { timestamp: string } }) {
  const parameters = await params;
  const timestamp = parameters.timestamp;

  if (!timestamp) {
    return <SearchPage timestamp={null} result={null} error={null} />;
  }

  const res = await fetchByTimestamp(timestamp);

  if (res && (res as any).error) {
    return <SearchPage timestamp={String(timestamp)} result={null} error={(res as any).message ?? "未知错误"} />;
  }

  return <SearchPage timestamp={String(timestamp)} result={res} error={null} />;
}