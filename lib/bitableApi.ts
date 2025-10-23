import { cacheGet, cacheSet } from "./cache";

const APP_ID = process.env.APP_ID || "";
const APP_SECRET = process.env.APP_SECRET || "";
const APP_TOKEN = process.env.APP_TOKEN || "";
const TABLE_ID = process.env.TABLE_ID || "";
const VIEW_ID = process.env.VIEW_ID || "";

// Concurrency control configuration
const MAX_CONCURRENT_REQUESTS = parseInt(process.env.MAX_CONCURRENT_REQUESTS || "5", 10);
const REQUEST_QUEUE_TIMEOUT = parseInt(process.env.REQUEST_QUEUE_TIMEOUT || "30000", 10); // 30-second timeout

// Rate limiting configuration
const MAX_REQUESTS_PER_SECOND = parseInt(process.env.MAX_REQUESTS_PER_SECOND || "10", 10); // Maximum requests per second

// Concurrency control state
let currentRequests = 0;
const requestQueue: Array<() => Promise<void>> = [];

// Rate limit state
let requestTimestamps: number[] = [];
let rateLimitInterval: NodeJS.Timeout | null = null;

export type TypedStr = {
  type: string;
  text: string;
}

export type BitableRecord = {
  record_id?: string;
  fields: {
    Name?: TypedStr[],
    SealDate?: number,
    Timestamp?: {
      type: number,
      value: TypedStr[]
    },
    TrackingNum?: TypedStr[],
    Type?: "Old" | "New" | null
  }
}

export type BitableResponse = {
  code: number;
  msg?: string;
  data?: {
    items?: [BitableRecord];
    record?: BitableRecord;
  };
};

/**
 * Initialize rate limit cleanup timer
 */
function initRateLimitCleanup() {
  if (!rateLimitInterval) {
    // Clean up expired request timestamps every second
    rateLimitInterval = setInterval(() => {
      const now = Date.now();
      requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < 1000);
    }, 1000);
  }
}

/**
 * Check if rate limit is exceeded
 */
function isRateLimited(): boolean {
  const now = Date.now();
  // First clean up expired timestamps
  requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < 1000);
  return requestTimestamps.length >= MAX_REQUESTS_PER_SECOND;
}

/**
 * Wait until request can be sent (within rate limits)
 */
async function waitForRateLimit(): Promise<void> {
  while (isRateLimited()) {
    // Wait a short time before retrying
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // Record current request timestamp
  requestTimestamps.push(Date.now());
}

/**
 * Concurrency control and rate limiting helper - queues requests and executes them according to limits
 */
async function executeWithConcurrencyControlAndRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  // Initialize rate limit cleanup timer
  initRateLimitCleanup();

  return new Promise((resolve, reject) => {
    // Set queue timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request queue timeout (${REQUEST_QUEUE_TIMEOUT}ms)`));
    }, REQUEST_QUEUE_TIMEOUT);

    const executeRequest = async () => {
      try {
        // Wait for rate limit allowance
        await waitForRateLimit();

        // Increase concurrent count
        currentRequests++;
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        clearTimeout(timeoutId);
        // Decrease concurrent count
        currentRequests--;
        // Process next request in queue
        if (requestQueue.length > 0) {
          const nextRequest = requestQueue.shift();
          if (nextRequest) nextRequest();
        }
      }
    };

    // Check if we can execute immediately
    if (currentRequests < MAX_CONCURRENT_REQUESTS) {
      executeRequest();
    } else {
      // Otherwise add to queue
      requestQueue.push(executeRequest);
    }
  });
}

/**
 * Get Lark app_access_token
 * Use cache to avoid frequent calls
 */
async function getAppAccessToken(): Promise<string> {
  const CACHE_KEY = 'feishu_app_access_token';
  const cachedToken = cacheGet(CACHE_KEY);

  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        app_secret: APP_SECRET
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get app_access_token: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();

    if (data.code !== 0 || !data.tenant_access_token) {
      throw new Error(`Failed to get app_access_token: ${data.msg || 'Unknown error'}`);
    }

    // Cache the token with a margin of 30 seconds to account for network latency
    const expireSeconds = Math.max(0, data.expire - 30);
    cacheSet(CACHE_KEY, data.tenant_access_token, expireSeconds);

    console.log(`Got app_access_token expires in ${expireSeconds}s`);
    return data.tenant_access_token;
  } catch (error) {
    console.error('Failed to get app_access_token:', error);
    throw error;
  }
}

/**
 * Server-side fetch helper to call Feishu Bitable search API by Timestamp.
 * Uses in-memory cache (lib/cache) and concurrency control.
 */
export async function fetchByTimestamp(timestamp: string | number): Promise<{ fromCache?: boolean } & BitableResponse & { error?: boolean; message?: string }> {
  const key = String(timestamp);
  const cached = cacheGet(key);
  if (cached) {
    return { fromCache: true, ...cached };
  }

  if (!APP_ID || !APP_SECRET || !APP_TOKEN || !TABLE_ID || !VIEW_ID) {
    return {
      error: true,
      message: "Missing env vars. Set APP_ID, APP_SECRET, APP_TOKEN, TABLE_ID, VIEW_ID.",
      code: -1
    };
  }

  try {
    // 使用并发控制和速率限制执行API请求
    const json = await executeWithConcurrencyControlAndRateLimit(async () => {
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records/search`;
      const body = {
        automatic_fields: false,
        field_names: ["Timestamp", "Name", "SealDate", "TrackingNum", "Type"],
        filter: {
          conditions: [
            {
              field_name: "Timestamp",
              operator: "is",
              value: [String(timestamp)]
            }
          ],
          conjunction: "and"
        },
        view_id: VIEW_ID,
        page_size: 50
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAppAccessToken()}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Feishu API error: ${res.status} ${text}`);
        }

        return (await res.json()) as BitableResponse;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    });

    // Cache the raw response object
    cacheSet(key, json);

    return { fromCache: false, ...json };
  } catch (err: any) {
    return {
      error: true,
      message: `Fetch failed: ${err?.message ?? String(err)}`,
      code: -1
    };
  }
}

/**
 * Submit a new record to Feishu Bitable.
 * Uses concurrency control and rate limiting.
 */
export async function submitBitableRecord(record: BitableRecord): Promise<BitableResponse & { error?: boolean; message?: string }> {
  if (!APP_ID || !APP_SECRET || !APP_TOKEN || !TABLE_ID) {
    return {
      error: true,
      message: "Missing env vars. Set APP_ID, APP_SECRET, APP_TOKEN, TABLE_ID.",
      code: -1
    };
  }

  try {
    // 使用并发控制和速率限制执行API请求
    const json = await executeWithConcurrencyControlAndRateLimit(async () => {
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`;
      const body = record;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAppAccessToken()}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Feishu API error: ${res.status} ${text}`);
        }

        return (await res.json()) as BitableResponse;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    });

    return json;
  } catch (err: any) {
    return {
      error: true,
      message: `Submit failed: ${err?.message ?? String(err)}`,
      code: -1
    };
  }
}
