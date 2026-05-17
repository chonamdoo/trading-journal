import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

interface MarketDerivativesInsight {
  symbol: string;
  fundingRate: number;
  fundingPaymentSide: 'long' | 'short' | 'neutral';
  longShortRatio: {
    longAccount: number;
    shortAccount: number;
    ratio: number;
  };
  openInterest: {
    baseAsset: number;
    notionalUsd: number;
  };
}

interface MarketDerivativesStatus {
  state: 'ready' | 'unavailable';
  source: 'binance-futures';
  reason?: string;
}

export interface MarketInsight {
  fearGreed: { value: number; classification: string };
  btcDominance: number;
  btcPrice: number;
  btcChange24h: number;
  totalMarketCap: number;
  derivatives: MarketDerivativesInsight | null;
  derivativesStatus: MarketDerivativesStatus;
}

/** 인메모리 캐시 (30분) */
let cache: { data: MarketInsight; timestamp: number; ttlMs: number } | null = null;
const CACHE_SECONDS = 30 * 60;
const DEGRADED_CACHE_SECONDS = 60;
const FRESH_FETCH_OPTIONS = { cache: 'no-store' } as const;
const BTC_SYMBOL = 'BTCUSDT';
const BINANCE_FUTURES_BASE_URL = 'https://fapi.binance.com';

function assertFiniteNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Invalid market insight payload');
  }
  return value;
}

function assertNumericString(value: unknown): number {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Invalid market insight payload');
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error('Invalid market insight payload');
  }
  return parsed;
}

function fundingPaymentSide(rate: number): MarketDerivativesInsight['fundingPaymentSide'] {
  if (rate > 0) return 'long';
  if (rate < 0) return 'short';
  return 'neutral';
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function cacheSecondsFor(insight: MarketInsight): number {
  return insight.derivativesStatus.state === 'ready'
    ? CACHE_SECONDS
    : DEGRADED_CACHE_SECONDS;
}

function cacheControlHeaderFor(insight: MarketInsight): string {
  return `public, max-age=${cacheSecondsFor(insight)}`;
}

function writeCache(insight: MarketInsight): void {
  cache = {
    data: insight,
    timestamp: Date.now(),
    ttlMs: cacheSecondsFor(insight) * 1000,
  };
}

/** Binance Futures 응답 실패를 공개 가능한 안정 코드로 요약한다. */
function providerFailureReason(
  premiumRes: Response,
  openInterestRes: Response,
  longShortRes: Response
): string | null {
  const failed = [
    ['premiumIndex', premiumRes],
    ['openInterest', openInterestRes],
    ['globalLongShortAccountRatio', longShortRes],
  ]
    .filter(([, response]) => !(response as Response).ok)
    .map(([name, response]) => `${name}:${(response as Response).status}`);

  return failed.length > 0 ? failed.join(',') : null;
}

/** Binance Futures 파생상품 데이터를 조회하고 실패 사유를 정규화한다. */
async function fetchDerivativesInsight(): Promise<{
  data: MarketDerivativesInsight | null;
  status: MarketDerivativesStatus;
}> {
  try {
    const [premiumRes, openInterestRes, longShortRes] = await Promise.all([
      fetch(`${BINANCE_FUTURES_BASE_URL}/fapi/v1/premiumIndex?symbol=${BTC_SYMBOL}`, FRESH_FETCH_OPTIONS),
      fetch(`${BINANCE_FUTURES_BASE_URL}/fapi/v1/openInterest?symbol=${BTC_SYMBOL}`, FRESH_FETCH_OPTIONS),
      fetch(
        `${BINANCE_FUTURES_BASE_URL}/futures/data/globalLongShortAccountRatio?symbol=${BTC_SYMBOL}&period=1h&limit=1`,
        FRESH_FETCH_OPTIONS
      ),
    ]);

    const failureReason = providerFailureReason(premiumRes, openInterestRes, longShortRes);
    if (failureReason) {
      return {
        data: null,
        status: {
          state: 'unavailable',
          source: 'binance-futures',
          reason: failureReason,
        },
      };
    }

    const premiumData = await premiumRes.json() as {
      symbol?: string;
      lastFundingRate?: string;
      markPrice?: string;
    };
    const openInterestData = await openInterestRes.json() as {
      openInterest?: string;
    };
    const longShortData = await longShortRes.json() as Array<{
      longAccount?: string;
      shortAccount?: string;
      longShortRatio?: string;
    }>;

    const longShortItem = longShortData[0];
    if (!premiumData.symbol || !longShortItem) {
      return {
        data: null,
        status: {
          state: 'unavailable',
          source: 'binance-futures',
          reason: 'empty-payload',
        },
      };
    }

    const fundingRate = round(assertNumericString(premiumData.lastFundingRate) * 100, 4);
    const markPrice = assertNumericString(premiumData.markPrice);
    const openInterest = assertNumericString(openInterestData.openInterest);

    return {
      data: {
        symbol: premiumData.symbol,
        fundingRate,
        fundingPaymentSide: fundingPaymentSide(fundingRate),
        longShortRatio: {
          longAccount: round(assertNumericString(longShortItem.longAccount) * 100, 1),
          shortAccount: round(assertNumericString(longShortItem.shortAccount) * 100, 1),
          ratio: assertNumericString(longShortItem.longShortRatio),
        },
        openInterest: {
          baseAsset: openInterest,
          notionalUsd: Math.round(openInterest * markPrice),
        },
      },
      status: {
        state: 'ready',
        source: 'binance-futures',
      },
    };
  } catch (error) {
    const reason = error instanceof Error && error.message === 'Invalid market insight payload'
      ? 'invalid-payload'
      : 'request-exception';

    return {
      data: null,
      status: {
        state: 'unavailable',
        source: 'binance-futures',
        reason,
      },
    };
  }
}

/** 마켓 인사이트 API — 인증 불필요, IP Rate Limit만 적용 (분당 30회) */
export async function GET(req: NextRequest) {
  // Rate Limit (IP 기반, 분당 30회)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
  const rateLimitResult = checkRateLimit(`ip:${ip}`, RATE_LIMITS.write);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
        },
      }
    );
  }

  // 캐시 체크
  if (cache && Date.now() - cache.timestamp < cache.ttlMs) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': cacheControlHeaderFor(cache.data) },
    });
  }

  try {
    const [fgRes, globalRes, btcRes, derivativesResult] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1', FRESH_FETCH_OPTIONS),
      fetch('https://api.coingecko.com/api/v3/global', FRESH_FETCH_OPTIONS),
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        FRESH_FETCH_OPTIONS
      ),
      fetchDerivativesInsight(),
    ]);

    if (
      !fgRes.ok
      || !globalRes.ok
      || !btcRes.ok
    ) {
      throw new Error('External API error');
    }

    const fgData = await fgRes.json() as {
      data?: Array<{ value: string; value_classification: string }>;
    };
    const globalData = await globalRes.json() as {
      data?: {
        market_cap_percentage?: { btc?: number };
        total_market_cap?: { usd?: number };
      };
    };
    const btcData = await btcRes.json() as {
      bitcoin?: { usd?: number; usd_24h_change?: number };
    };
    const fearGreedItem = fgData.data?.[0];
    if (!fearGreedItem?.value_classification) {
      throw new Error('Invalid market insight payload');
    }

    const insight: MarketInsight = {
      fearGreed: {
        value: assertNumericString(fearGreedItem.value),
        classification: fearGreedItem.value_classification,
      },
      btcDominance: assertFiniteNumber(globalData.data?.market_cap_percentage?.btc),
      btcPrice: assertFiniteNumber(btcData.bitcoin?.usd),
      btcChange24h: assertFiniteNumber(btcData.bitcoin?.usd_24h_change),
      totalMarketCap: assertFiniteNumber(globalData.data?.total_market_cap?.usd),
      derivatives: derivativesResult.data,
      derivativesStatus: derivativesResult.status,
    };

    writeCache(insight);
    return NextResponse.json(insight, {
      headers: { 'Cache-Control': cacheControlHeaderFor(insight) },
    });
  } catch {
    // stale 캐시 반환
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': cacheControlHeaderFor(cache.data) },
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 502 }
    );
  }
}
