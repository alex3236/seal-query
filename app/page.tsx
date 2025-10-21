import React from "react";
import SearchPage from "@/components/SearchPage";

/**
 * Home page handler (server component).
 * Accepts ?timestamp=... and performs SSR fetch.
 */
export default async function Page() {
  return <SearchPage timestamp={null} result={null} error={null} />;
}
