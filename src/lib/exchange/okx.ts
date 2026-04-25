import { createHmac } from 'crypto';

const OKX_BASE_URL = 'https://www.okx.com';
const OKX_REQUEST_TIMEOUT_MS = 8_000;

interface OkxApiResponse<T> {
  code: string;
  msg: string;
  data: T[];
}

export interface OkxAccountConfig {
  acctLv?: string;
  posMode?: string;
  uid?: string;
}

export interface OkxFillHistory {
  instType: string;
  instId: string;
  tradeId: string;
  ordId: string;
  billId: string;
  fillPx: string;
  fillSz: string;
  fillPnl: string;
  fillTime: string;
  fee: string;
  feeCcy: string;
  posSide: 'long' | 'short' | 'net' | string;
  side: 'buy' | 'sell' | string;
  lever?: string;
}

export interface OkxPermissionCheck {
  canRead: boolean;
  accountLevel: string | null;
  positionMode: string | null;
}

function signRequest(params: {
  timestamp: string;
  method: 'GET';
  requestPath: string;
  apiSecret: string;
}): string {
  const payload = `${params.timestamp}${params.method}${params.requestPath}`;
  return createHmac('sha256', params.apiSecret).update(payload).digest('base64');
}

async function signedGet<T>(
  path: string,
  apiKey: string,
  apiSecret: string,
  passphrase: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OKX_REQUEST_TIMEOUT_MS);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  const requestPath = `${path}${query ? `?${query}` : ''}`;
  const timestamp = new Date().toISOString();
  const signature = signRequest({
    timestamp,
    method: 'GET',
    requestPath,
    apiSecret,
  });

  let response: Response;
  try {
    response = await fetch(`${OKX_BASE_URL}${requestPath}`, {
      method: 'GET',
      headers: {
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OKX API request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`OKX API request failed (${response.status}).`);
  }

  const body = await response.json() as OkxApiResponse<T>;
  if (body.code !== '0') {
    throw new Error(body.msg ? `OKX API error ${body.code}: ${body.msg}` : `OKX API error (${body.code}).`);
  }

  return body.data;
}

async function signedGetPage<T>(
  path: string,
  apiKey: string,
  apiSecret: string,
  passphrase: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  return signedGet<T>(path, apiKey, apiSecret, passphrase, params);
}

export async function verifyOkxReadConnection(
  apiKey: string,
  apiSecret: string,
  passphrase: string,
): Promise<OkxPermissionCheck> {
  if (!apiKey.trim() || !apiSecret.trim() || !passphrase.trim()) {
    throw new Error('OKX API key, secret, and passphrase are required.');
  }

  let configs: OkxAccountConfig[];
  try {
    configs = await signedGet<OkxAccountConfig>(
      '/api/v5/account/config',
      apiKey,
      apiSecret,
      passphrase,
    );
  } catch {
    throw new Error('OKX API key permission check failed. Check read-only permissions, passphrase, and IP whitelist settings.');
  }

  const config = configs[0];
  return {
    canRead: true,
    accountLevel: config?.acctLv ?? null,
    positionMode: config?.posMode ?? null,
  };
}

export async function fetchOkxSwapFillsHistory(params: {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  startTime: number;
  endTime: number;
  limit?: number;
}): Promise<OkxFillHistory[]> {
  const results: OkxFillHistory[] = [];
  let after: string | undefined;
  const limit = params.limit ?? 100;

  do {
    const page = await signedGetPage<OkxFillHistory>(
      '/api/v5/trade/fills-history',
      params.apiKey,
      params.apiSecret,
      params.passphrase,
      {
        instType: 'SWAP',
        begin: params.startTime,
        end: params.endTime,
        limit,
        ...(after ? { after } : {}),
      },
    );
    results.push(...page);
    after = page.length === limit ? page[page.length - 1]?.billId : undefined;
  } while (after);

  return results;
}

export async function fetchOkxSwapFillsHistoryPage(params: {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  startTime: number;
  endTime: number;
  after?: string;
  limit?: number;
}): Promise<OkxFillHistory[]> {
  return signedGetPage<OkxFillHistory>(
    '/api/v5/trade/fills-history',
    params.apiKey,
    params.apiSecret,
    params.passphrase,
    {
      instType: 'SWAP',
      begin: params.startTime,
      end: params.endTime,
      limit: params.limit ?? 100,
      ...(params.after ? { after: params.after } : {}),
    },
  );
}
