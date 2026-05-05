import 'server-only';

import { createHmac } from 'crypto';

const BITGET_BASE_URL = 'https://api.bitget.com';
const BITGET_REQUEST_TIMEOUT_MS = 8_000;

interface BitgetApiResponse<T> {
  code: string;
  msg: string;
  requestTime: number;
  data: T;
}

interface BitgetAccountInfo {
  userId: string;
  ips?: string;
  authorities?: string[];
}

interface BitgetFuturesAccount {
  marginCoin: string;
  available: string;
  accountEquity: string;
  usdtEquity: string;
}

export interface BitgetOrderFill {
  tradeId: string;
  orderId: string;
  symbol: string;
  productType: string;
  side: 'buy' | 'sell' | string;
  tradeSide?: string;
  price: string;
  size?: string;
  baseVolume?: string;
  quoteVolume: string;
  profit: string;
  fee?: string;
  feeDetail?: { feeCoin?: string; totalFee?: string; totalDeductionFee?: string }[];
  cTime: string;
}

export interface BitgetPermissionCheck {
  canRead: boolean;
  futuresReadEnabled: boolean;
  ipRestricted: boolean;
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
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BITGET_REQUEST_TIMEOUT_MS);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  const requestPath = `${path}${query ? `?${query}` : ''}`;
  const timestamp = String(Date.now());
  const signature = signRequest({
    timestamp,
    method: 'GET',
    requestPath,
    apiSecret,
  });

  let response: Response;
  try {
    response = await fetch(`${BITGET_BASE_URL}${requestPath}`, {
      method: 'GET',
      headers: {
        'ACCESS-KEY': apiKey,
        'ACCESS-SIGN': signature,
        'ACCESS-PASSPHRASE': passphrase,
        'ACCESS-TIMESTAMP': timestamp,
        locale: 'en-US',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Bitget API request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Bitget API request failed (${response.status}).`);
  }

  const body = await response.json() as BitgetApiResponse<T>;
  if (body.code !== '00000') {
    throw new Error(body.msg ? `Bitget API error ${body.code}: ${body.msg}` : `Bitget API error (${body.code}).`);
  }

  return body.data;
}

function hasReadOnlyFuturesPermissions(authorities: string[] = []): boolean {
  const hasRead = authorities.includes('cpor') || authorities.includes('coor');
  const hasWrite = authorities.some((authority) => ['cpow', 'coow', 'wtow', 'wwow'].includes(authority));
  return hasRead && !hasWrite;
}

export async function verifyBitgetReadConnection(
  apiKey: string,
  apiSecret: string,
  passphrase: string,
): Promise<BitgetPermissionCheck> {
  if (!apiKey.trim() || !apiSecret.trim() || !passphrase.trim()) {
    throw new Error('Bitget API key, secret, and passphrase are required.');
  }

  let info: BitgetAccountInfo;
  try {
    info = await signedGet<BitgetAccountInfo>(
      '/api/v2/spot/account/info',
      apiKey,
      apiSecret,
      passphrase,
    );
  } catch {
    throw new Error('Bitget API key permission check failed. Check read-only permissions, passphrase, and IP whitelist settings.');
  }

  const futuresReadEnabled = hasReadOnlyFuturesPermissions(info.authorities);
  if (!futuresReadEnabled) {
    throw new Error('Bitget API key must be read-only and include futures order/position read permissions.');
  }

  await signedGet<BitgetFuturesAccount[]>(
    '/api/v2/mix/account/accounts',
    apiKey,
    apiSecret,
    passphrase,
    { productType: 'USDT-FUTURES' },
  );

  return {
    canRead: true,
    futuresReadEnabled,
    ipRestricted: Boolean(info.ips?.trim()),
  };
}

export async function fetchBitgetOrderFills(params: {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  startTime: number;
  endTime: number;
  limit?: number;
}): Promise<BitgetOrderFill[]> {
  const results: BitgetOrderFill[] = [];
  let idLessThan: string | undefined;
  const limit = params.limit ?? 100;

  do {
    const data = await signedGet<BitgetOrderFill[] | { fillList?: BitgetOrderFill[]; endId?: string }>(
      '/api/v2/mix/order/fills',
      params.apiKey,
      params.apiSecret,
      params.passphrase,
      {
        productType: 'USDT-FUTURES',
        startTime: params.startTime,
        endTime: params.endTime,
        limit,
        ...(idLessThan ? { idLessThan } : {}),
      },
    );
    const page = Array.isArray(data) ? data : data.fillList ?? [];
    results.push(...page);
    idLessThan = !Array.isArray(data) && page.length === limit ? data.endId : undefined;
  } while (idLessThan);

  return results;
}
