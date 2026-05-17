import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const successPayloads = [
  {
    ok: true,
    json: async () => ({
      name: 'Fear and Greed Index',
      data: [{ value: '40', value_classification: 'Fear' }],
      metadata: { error: null },
    }),
  },
  {
    ok: true,
    json: async () => ({
      data: {
        market_cap_percentage: { btc: 51.25 },
        total_market_cap: { usd: 2_700_000_000_000 },
      },
    }),
  },
  {
    ok: true,
    json: async () => ({
      bitcoin: {
        usd: 91_500,
        usd_24h_change: -2.35,
      },
    }),
  },
  {
    ok: true,
    json: async () => ({
      symbol: 'BTCUSDT',
      lastFundingRate: '-0.000028',
      markPrice: '91500.00',
    }),
  },
  {
    ok: true,
    json: async () => ({
      symbol: 'BTCUSDT',
      openInterest: '104890.25',
    }),
  },
  {
    ok: true,
    json: async () => ([
      {
        symbol: 'BTCUSDT',
        longAccount: '0.424',
        shortAccount: '0.576',
        longShortRatio: '0.7361',
      },
    ]),
  },
];

function mockFetchSequence(...responses: Array<{ ok: boolean; json: () => Promise<unknown> }>) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function loadRoute() {
  vi.resetModules();
  return import('@/app/api/market/insight/route');
}

describe('GET /api/market/insight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-05T00:00:00Z'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('maps public provider data into MarketInsight', async () => {
    const fetchMock = mockFetchSequence(...successPayloads);
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.10' },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      'https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=1',
      { next: { revalidate: 1800 } },
    );
    expect(body).toEqual({
      fearGreed: { value: 40, classification: 'Fear' },
      btcDominance: 51.25,
      btcPrice: 91_500,
      btcChange24h: -2.35,
      totalMarketCap: 2_700_000_000_000,
      derivatives: {
        symbol: 'BTCUSDT',
        fundingRate: -0.0028,
        fundingPaymentSide: 'short',
        longShortRatio: {
          longAccount: 42.4,
          shortAccount: 57.6,
          ratio: 0.7361,
        },
        openInterest: {
          baseAsset: 104_890.25,
          notionalUsd: 9_597_457_875,
        },
      },
      derivativesStatus: {
        state: 'ready',
        source: 'binance-futures',
      },
    });
  });

  it('keeps market insight visible when derivatives provider fails', async () => {
    const failedLongShort = {
      ok: false,
      status: 451,
      json: async () => ({}),
    };
    mockFetchSequence(
      ...successPayloads.slice(0, 5),
      failedLongShort,
    );
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.14' },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.derivatives).toBeNull();
    expect(body.derivativesStatus).toEqual({
      state: 'unavailable',
      source: 'binance-futures',
      reason: 'globalLongShortAccountRatio:451',
    });
    expect(body.btcPrice).toBe(91_500);
  });

  it('normalizes derivatives parsing failures to stable reason codes', async () => {
    mockFetchSequence(
      ...successPayloads.slice(0, 3),
      {
        ok: true,
        json: async () => ({
          symbol: 'BTCUSDT',
          lastFundingRate: '',
          markPrice: '91500.00',
        }),
      },
      ...successPayloads.slice(4, 6),
    );
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.15' },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.derivatives).toBeNull();
    expect(body.derivativesStatus).toEqual({
      state: 'unavailable',
      source: 'binance-futures',
      reason: 'invalid-payload',
    });
  });

  it('returns stale cache when providers fail after the cache ttl', async () => {
    mockFetchSequence(
      ...successPayloads,
      { ok: false, json: async () => ({}) },
      { ok: true, json: async () => ({}) },
      { ok: true, json: async () => ({}) },
    );
    const { GET } = await loadRoute();

    const first = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.11' },
    }));
    const cachedBody = await first.json();

    vi.setSystemTime(new Date('2026-05-05T00:31:00Z'));

    const second = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.11' },
    }));
    const body = await second.json();

    expect(second.status).toBe(200);
    expect(body).toEqual(cachedBody);
  });

  it('returns 502 when provider payloads are malformed and no stale cache exists', async () => {
    mockFetchSequence(
      { ok: true, json: async () => ({ data: [] }) },
      { ok: true, json: async () => ({ data: {} }) },
      { ok: true, json: async () => ({ bitcoin: {} }) },
    );
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/market/insight', {
      headers: { 'x-forwarded-for': '203.0.113.12' },
    }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: 'Failed to fetch market data' });
  });

  it('limits public market insight requests to 30 per minute per ip', async () => {
    mockFetchSequence(...successPayloads);
    const { GET } = await loadRoute();

    let lastResponse: Response | null = null;
    for (let i = 0; i < 31; i += 1) {
      lastResponse = await GET(new NextRequest('http://localhost/api/market/insight', {
        headers: { 'x-forwarded-for': '203.0.113.13' },
      }));
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.headers.get('Retry-After')).toBe('60');
  });
});
