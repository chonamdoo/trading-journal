import { createHmac } from 'crypto';

const BINANCE_REST_BASE_URL = 'https://api.binance.com';
const BINANCE_FUTURES_BASE_URL = 'https://fapi.binance.com';
const BINANCE_REQUEST_TIMEOUT_MS = 8_000;

interface BinanceApiError {
  code?: number;
  msg?: string;
}

interface BinanceApiRestrictions {
  enableReading?: boolean;
  enableSpotAndMarginTrading?: boolean;
  enableWithdrawals?: boolean;
  enableInternalTransfer?: boolean;
  permitsUniversalTransfer?: boolean;
  enableFutures?: boolean;
  ipRestrict?: boolean;
}

export interface BinancePermissionCheck {
  canRead: boolean;
  futuresEnabled: boolean;
  ipRestricted: boolean;
}

export interface BinanceIncome {
  symbol: string;
  incomeType: string;
  income: string;
  asset: string;
  info: string;
  time: number;
  tranId: number;
  tradeId: string;
}

export interface BinanceUserTrade {
  buyer: boolean;
  commission: string;
  commissionAsset: string;
  id: number;
  maker: boolean;
  orderId: number;
  price: string;
  qty: string;
  quoteQty: string;
  realizedPnl: string;
  side: 'BUY' | 'SELL' | string;
  positionSide: 'BOTH' | 'LONG' | 'SHORT' | string;
  symbol: string;
  time: number;
}

function signQuery(query: string, apiSecret: string): string {
  return createHmac('sha256', apiSecret).update(query).digest('hex');
}

async function signedGet<T>(
  baseUrl: string,
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BINANCE_REQUEST_TIMEOUT_MS);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }
  searchParams.set('timestamp', String(Date.now()));
  searchParams.set('recvWindow', '5000');

  const query = searchParams.toString();
  const signature = signQuery(query, apiSecret);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}?${query}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Binance API request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let errorBody: BinanceApiError = {};
    try {
      errorBody = await response.json() as BinanceApiError;
    } catch {
      // Keep a generic error below.
    }
    throw new Error(errorBody.msg ?? `Binance API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

async function getApiRestrictions(
  apiKey: string,
  apiSecret: string,
): Promise<BinanceApiRestrictions> {
  return signedGet<BinanceApiRestrictions>(
    BINANCE_REST_BASE_URL,
    '/sapi/v1/account/apiRestrictions',
    apiKey,
    apiSecret,
  );
}

export async function fetchBinanceRealizedPnlIncomes(params: {
  apiKey: string;
  apiSecret: string;
  startTime: number;
  endTime: number;
  limit?: number;
}): Promise<BinanceIncome[]> {
  return signedGet<BinanceIncome[]>(
    BINANCE_FUTURES_BASE_URL,
    '/fapi/v1/income',
    params.apiKey,
    params.apiSecret,
    {
      incomeType: 'REALIZED_PNL',
      startTime: params.startTime,
      endTime: params.endTime,
      limit: params.limit ?? 1000,
    },
  );
}

export async function fetchBinanceUserTrades(params: {
  apiKey: string;
  apiSecret: string;
  symbol: string;
  startTime: number;
  endTime: number;
  limit?: number;
}): Promise<BinanceUserTrade[]> {
  return signedGet<BinanceUserTrade[]>(
    BINANCE_FUTURES_BASE_URL,
    '/fapi/v1/userTrades',
    params.apiKey,
    params.apiSecret,
    {
      symbol: params.symbol,
      startTime: params.startTime,
      endTime: params.endTime,
      limit: params.limit ?? 1000,
    },
  );
}

export async function verifyBinanceReadConnection(
  apiKey: string,
  apiSecret: string,
): Promise<BinancePermissionCheck> {
  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error('Binance API key and secret are required.');
  }

  let restrictions: BinanceApiRestrictions;
  try {
    restrictions = await getApiRestrictions(apiKey, apiSecret);
  } catch {
    throw new Error('Binance API key permission check failed. Check read-only permissions and IP whitelist settings.');
  }

  if (restrictions.enableWithdrawals) {
    throw new Error('Withdrawal-enabled Binance API keys are not allowed.');
  }
  if (restrictions.enableSpotAndMarginTrading) {
    throw new Error('Trading-enabled Binance API keys are not allowed.');
  }
  if (restrictions.enableInternalTransfer || restrictions.permitsUniversalTransfer) {
    throw new Error('Transfer-enabled Binance API keys are not allowed.');
  }
  if (!restrictions.enableReading || !restrictions.enableFutures) {
    throw new Error('Binance API key must have reading and futures access enabled.');
  }

  // Futures account read access is the minimum proof that sync can work.
  await signedGet(
    BINANCE_FUTURES_BASE_URL,
    '/fapi/v2/account',
    apiKey,
    apiSecret,
  );

  return {
    canRead: restrictions.enableReading,
    futuresEnabled: restrictions.enableFutures,
    ipRestricted: restrictions.ipRestrict ?? false,
  };
}
