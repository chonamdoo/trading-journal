import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/api/rate-limit';

export interface MarketInsight {
  fearGreed: { value: number; classification: string };
  btcDominance: number;
  btcPrice: number;
  btcChange24h: number;
  totalMarketCap: number;
}

/** 인메모리 캐시 (5분) */
let cache: { data: MarketInsight; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

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
    const [fgRes, globalRes, btcRes] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 300 } }),
      fetch('https://api.coingecko.com/api/v3/global', { next: { revalidate: 300 } }),
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 300 } }
      ),
    ]);

    if (!fgRes.ok || !globalRes.ok || !btcRes.ok) {
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

    const insight: MarketInsight = {
      fearGreed: {
        value: Number(fgData.data?.[0]?.value ?? 50),
        classification: fgData.data?.[0]?.value_classification ?? 'Neutral',
      },
      btcDominance: globalData.data?.market_cap_percentage?.btc ?? 0,
      btcPrice: btcData.bitcoin?.usd ?? 0,
      btcChange24h: btcData.bitcoin?.usd_24h_change ?? 0,
      totalMarketCap: globalData.data?.total_market_cap?.usd ?? 0,
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
