import React from "react";
import SearchPage from "@/components/SearchPage";
import InitialSetup from "@/components/InitialSetup";

export type envDesc = string | {
  desc: string;
  url: string;
}

const ENV_VAR_DESCS: Record<string, envDesc> = {
  "APP_ID": {
    desc: "应用 ID",
    url: "https://open.feishu.cn/document/server-docs/api-call-guide/terminology#b047be0c",
  },
  "APP_SECRET": {
    desc: "应用密钥",
    url: "https://open.feishu.cn/document/server-docs/api-call-guide/terminology#1b5fb6cd",
  },
  "APP_TOKEN": {
    desc: "应用令牌",
    url: "https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview#-752212c",
  },
  "TABLE_ID": {
    desc: "表格 ID",
    url: "https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview#8ff3bb0b",
  },
  "VIEW_ID": {
    desc: "视图 ID",
    url: "https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview#5b05b8ca",
  },
  "API_URL_CREATE": "创建记录 API URL",
  "API_URL_SEARCH": "搜索记录 API URL",
  "APP_URL_ACCESS_TOKEN": "应用访问令牌 API URL",
  "TOTP_SECRET": {
    desc: "TOTP 密钥",
    url: "/totp",
  },
}

function getMissingEnvs(): Record<string, envDesc> {
  const missing: Record<string, envDesc> = {};
  for (const envVar of Object.keys(ENV_VAR_DESCS)) {
    if (!process.env[envVar]) {
      missing[envVar] = ENV_VAR_DESCS[envVar];
    }
  }
  return missing;
}

/**
 * Home page handler (server component).
 * Accepts ?timestamp=... and performs SSR fetch.
 */
export default async function Page() {
  const missingEnvs = getMissingEnvs();
  if (Object.keys(missingEnvs).length > 0) {
    return <InitialSetup missingEnvs={missingEnvs} />;
  }
  return <SearchPage codeA={null} result={null} error={null} />;
}
