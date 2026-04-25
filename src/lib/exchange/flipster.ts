import { createHmac } from 'crypto';

const FLIPSTER_BASE_URL = 'https://trading-api.flipster.io';
const FLIPSTER_REQUEST_TIMEOUT_MS = 8_000;
const FLIPSTER_EXPIRES_WINDOW_SECONDS = 30;

interface FlipsterAccountInfo {
  totalWalletBalance: string;
  totalUnrealizedPnl: string;
  totalMarginBalance: string;
  totalMarginReserved: string;
  availableBalance: string;
}

export interface FlipsterPermissionCheck {
  canRead: boolean;
  totalMarginBalance: string;
  availableBalance: string;
}

function signRequest(params: {
  apiSecret: string;
  method: string;
  pathWithQuery: string;
  expires: number;
  body?: string;
}): string {
  const payload = `${params.method}${params.pathWithQuery}${params.expires}${params.body ?? ''}`;
  return createHmac('sha256', params.apiSecret).update(payload).digest('hex');
}

async function signedRequest<T>(
  method: 'GET',
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FLIPSTER_REQUEST_TIMEOUT_MS);
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) => a.localeCompare(b))) {
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  const pathWithQuery = `${path}${query ? `?${query}` : ''}`;
  const expires = Math.floor(Date.now() / 1000) + FLIPSTER_EXPIRES_WINDOW_SECONDS;
  const signature = signRequest({
    apiSecret,
    method,
    pathWithQuery,
    expires,
  });

  let response: Response;
  try {
    response = await fetch(`${FLIPSTER_BASE_URL}${pathWithQuery}`, {
      method,
      headers: {
        'api-key': apiKey,
        'api-expires': String(expires),
        'api-signature': signature,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Flipster API request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let message = `Flipster API request failed (${response.status}).`;
    try {
      const body = await response.json() as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep generic message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function verifyFlipsterReadConnection(
  apiKey: string,
  apiSecret: string,
): Promise<FlipsterPermissionCheck> {
  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error('Flipster API key and secret are required.');
  }

  let accountInfo: FlipsterAccountInfo;
  try {
    accountInfo = await signedRequest<FlipsterAccountInfo>(
      'GET',
      '/api/v1/account',
      apiKey,
      apiSecret,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Flipster API error.';
    console.warn('Flipster API key permission check failed', { reason: message });
    throw new Error('Flipster API key permission check failed. Check read-only permissions and API access.');
  }

  return {
    canRead: true,
    totalMarginBalance: accountInfo.totalMarginBalance,
    availableBalance: accountInfo.availableBalance,
  };
}
