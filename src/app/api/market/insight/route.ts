import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/api/rate-limit';

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

export interface MarketInsight {
  fearGreed: { value: number; classification: string };
  btcDominance: number;
  btcPrice: number;
  btcChange24h: number;
  totalMarketCap: number;
  derivatives: MarketDerivativesInsight | null;
}

/** 인메모리 캐시 (5분) */
let cache: { data: MarketInsight; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;
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

async function fetchDerivativesInsight(): Promise<MarketDerivativesInsight | null> {
  try {
    const [premiumRes, openInterestRes, longShortRes] = await Promise.all([
      fetch(`${BINANCE_FUTURES_BASE_URL}/fapi/v1/premiumIndex?symbol=${BTC_SYMBOL}`, {
        next: { revalidate: 300 },
      }),
      fetch(`${BINANCE_FUTURES_BASE_URL}/fapi/v1/openInterest?symbol=${BTC_SYMBOL}`, {
        next: { revalidate: 300 },
      }),
      fetch(`${BINANCE_FUTURES_BASE_URL}/futures/data/topLongShortAccountRatio?symbol=${BTC_SYMBOL}&period=1h&limit=1`, {
        next: { revalidate: 300 },
      }),
    ]);

    if (!premiumRes.ok || !openInterestRes.ok || !longShortRes.ok) {
      return null;
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
      return null;
    }

    const fundingRate = round(assertNumericString(premiumData.lastFundingRate) * 100, 4);
    const markPrice = assertNumericString(premiumData.markPrice);
    const openInterest = assertNumericString(openInterestData.openInterest);

    return {
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
    };
  } catch {
    return null;
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
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const [fgRes, globalRes, btcRes, derivatives] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 300 } }),
      fetch('https://api.coingecko.com/api/v3/global', { next: { revalidate: 300 } }),
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 300 } }
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
      derivatives,
    };

    cache = { data: insight, timestamp: Date.now() };
    return NextResponse.json(insight, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch {
    // stale 캐시 반환
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'public, max-age=60' },
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 502 }
    );
  }
}
