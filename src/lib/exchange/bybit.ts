import 'server-only';

import { createHmac } from 'crypto';

const BYBIT_BASE_URLS = ['https://api.bybit.com', 'https://api.bytick.com'];
const BYBIT_RECV_WINDOW = '5000';
const BYBIT_REQUEST_TIMEOUT_MS = 8_000;

interface BybitApiResponse<T> {
  retCode: number;
  retMsg: string;
  result: T;
  retExtInfo: Record<string, unknown>;
  time: number;
}

interface BybitApiKeyInfo {
  readOnly: 0 | 1 | number;
  permissions: {
    ContractTrade?: string[];
    Derivatives?: string[];
    Wallet?: string[];
    Spot?: string[];
    Options?: string[];
  };
  ips?: string[];
  type?: number;
  uta?: number;
  unified?: number;
}

export interface BybitClosedPnl {
  symbol: string;
  orderId: string;
  side: 'Buy' | 'Sell' | string;
  qty: string;
  closedSize: string;
  avgEntryPrice: string;
  avgExitPrice: string;
  closedPnl: string;
  leverage: string;
  openFee?: string;
  closeFee?: string;
  cumEntryValue: string;
  cumExitValue: string;
  createdTime: string;
  updatedTime: string;
}

interface BybitClosedPnlResult {
  category: string;
  list: BybitClosedPnl[];
  nextPageCursor?: string;
}

export interface BybitPermissionCheck {
  canRead: boolean;
  derivativesEnabled: boolean;
  ipRestricted: boolean;
  unifiedTradingAccount: boolean;
}

function signPayload(payload: string, apiSecret: string): string {
  return createHmac('sha256', apiSecret).update(payload).digest('hex');
}

async function signedGet<T>(
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const errors: string[] = [];

  for (const baseUrl of BYBIT_BASE_URLS) {
    try {
      return await signedGetFromBase<T>(baseUrl, path, apiKey, apiSecret, params);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Bybit API error.';
      errors.push(message);
    }
  }

  throw new Error(errors.length > 0 ? errors.join(' | ') : 'Bybit API request failed.');
}

async function signedGetFromBase<T>(
  baseUrl: string,
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string | number>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BYBIT_REQUEST_TIMEOUT_MS);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) => a.localeCompare(b))) {
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  const timestamp = String(Date.now());
  const signaturePayload = `${timestamp}${apiKey}${BYBIT_RECV_WINDOW}${query}`;
  const signature = signPayload(signaturePayload, apiSecret);
  const url = `${baseUrl}${path}${query ? `?${query}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BAPI-API-KEY': apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-RECV-WINDOW': BYBIT_RECV_WINDOW,
        'X-BAPI-SIGN': signature,
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Bybit API request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const host = new URL(baseUrl).host;
    throw new Error(`Bybit API request failed from ${host} (${response.status}).`);
  }

  const body = await response.json() as BybitApiResponse<T>;
  if (body.retCode !== 0) {
    throw new Error(body.retMsg ? `Bybit API error ${body.retCode}: ${body.retMsg}` : `Bybit API error (${body.retCode}).`);
  }

  return body.result;
}

function hasDerivativesReadPermission(info: BybitApiKeyInfo): boolean {
  const contractPermissions = info.permissions.ContractTrade ?? [];
  const derivativePermissions = info.permissions.Derivatives ?? [];
  return Boolean(
    contractPermissions.includes('Order')
      || contractPermissions.includes('Position')
      || derivativePermissions.length > 0,
  );
}

export async function fetchBybitClosedPnl(params: {
  apiKey: string;
  apiSecret: string;
  startTime: number;
  endTime: number;
  limit?: number;
}): Promise<BybitClosedPnl[]> {
  const results: BybitClosedPnl[] = [];
  let cursor: string | undefined;

  do {
    const response = await signedGet<BybitClosedPnlResult>(
      '/v5/position/closed-pnl',
      params.apiKey,
      params.apiSecret,
      {
        category: 'linear',
        startTime: params.startTime,
        endTime: params.endTime,
        limit: params.limit ?? 100,
        ...(cursor ? { cursor } : {}),
      },
    );

    results.push(...response.list);
    cursor = response.nextPageCursor || undefined;
  } while (cursor);

  return results;
}

export async function verifyBybitReadConnection(
  apiKey: string,
  apiSecret: string,
): Promise<BybitPermissionCheck> {
  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error('Bybit API key and secret are required.');
  }

  let keyInfo: BybitApiKeyInfo;
  try {
    keyInfo = await signedGet<BybitApiKeyInfo>(
      '/v5/user/query-api',
      apiKey,
      apiSecret,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Bybit API error.';
    console.warn('Bybit API key permission check failed', { reason: message });
    throw new Error('Bybit API key permission check failed. Check read-only permissions and IP whitelist settings.');
  }

  console.info('Bybit API key permission summary', {
    contractTrade: keyInfo.permissions.ContractTrade ?? [],
    derivatives: keyInfo.permissions.Derivatives ?? [],
    ipRestricted: Boolean(keyInfo.ips?.length),
    readOnly: keyInfo.readOnly,
    unified: keyInfo.unified,
    uta: keyInfo.uta,
  });

  if (keyInfo.readOnly !== 1) {
    throw new Error('Bybit API key must be read-only.');
  }

  const derivativesEnabled = hasDerivativesReadPermission(keyInfo);
  if (!derivativesEnabled) {
    throw new Error('Bybit API key must include derivatives/contract read permissions.');
  }

  return {
    canRead: true,
    derivativesEnabled,
    ipRestricted: Boolean(keyInfo.ips?.length),
    unifiedTradingAccount: keyInfo.uta === 1 || keyInfo.unified === 1,
  };
}
