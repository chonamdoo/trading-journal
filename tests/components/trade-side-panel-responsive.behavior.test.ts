import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/client-api', () => ({
  fetchEconomicCalendar: () => Promise.resolve({ success: true, data: [] }),
  fetchMarketInsight: () => Promise.resolve(null),
}));

vi.mock('@/hooks/useTrades', () => ({
  useTrades: () => ({
    trades: [],
    deposits: [],
    profile: { id: 'test-user', initial_capital: 0, pre_trade_checklist_items: [] },
    addTrade: () => undefined,
  }),
  useTradeStore: (selector: (state: { uploadScreenshots: () => Promise<void> }) => unknown) => selector({
    uploadScreenshots: () => Promise.resolve(),
  }),
}));

vi.mock('@/hooks/useAssets', () => ({
  useAssets: () => ({
    allAssets: ['BTC'],
    favorites: [],
    recentAssets: [],
    toggleFavorite: () => undefined,
  }),
}));

vi.mock('@/components/trades/TradeForm', () => ({
  TradeForm: () => createElement('form', { 'aria-label': 'trade form' }),
}));

vi.mock('@/components/trades/MotivationBanner', () => ({
  MotivationBanner: () => createElement('section', { 'aria-label': 'motivation banner' }),
}));

describe('trade side panel responsive market context', () => {
  it('renders the mobile risk check card and desktop terminal panel from the selected prototype', async () => {
    const { TradeSidePanel } = await import('@/components/trades/TradeSidePanel');
    const html = renderToStaticMarkup(createElement(TradeSidePanel));

    expect(html).toContain('진입 전 리스크 체크');
    expect(html).toContain('시장 요약');
    expect(html).toContain('다가오는 이벤트');
    expect(html).toContain('주요 뉴스 확인');
    expect(html).not.toContain('LIVE API');
    expect(html).not.toContain('30m cache');
    expect(html).toContain('리스크 모드');
    expect(html).toContain('min-[1120px]:hidden');
    expect(html).toContain('min-[1120px]:flex');

    const { default: NewTradePage } = await import('@/app/(main)/trades/new/page');
    const pageHtml = renderToStaticMarkup(createElement(NewTradePage));

    expect(pageHtml).toContain('min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(420px,500px)]');
    expect(pageHtml).not.toContain('hidden lg:block w-[280px]');
  });

  it('renders funding rate without applying percentage conversion twice', async () => {
    const { buildTickerCards } = await import('@/components/trades/TradeSidePanel');

    const cards = buildTickerCards({
      fearGreed: { value: 40, classification: 'Fear' },
      btcDominance: 51.25,
      btcPrice: 91_500,
      btcChange24h: -2.35,
      totalMarketCap: 2_700_000_000_000,
      derivatives: {
        asset: 'BTC',
        symbol: 'BTCUSDT',
        exchange: 'Binance',
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
        assets: [
          {
            asset: 'BTC',
            symbol: 'BTCUSDT',
            exchange: 'Binance',
            fundingRate: -0.0028,
            fundingPaymentSide: 'short',
            longShortRatio: {
              longAccount: 42.4,
              shortAccount: 57.6,
              ratio: 0.7361,
            },
          },
          {
            asset: 'ETH',
            symbol: 'ETHUSDT',
            exchange: 'Binance',
            fundingRate: 0.0041,
            fundingPaymentSide: 'long',
            longShortRatio: {
              longAccount: 54.1,
              shortAccount: 45.9,
              ratio: 1.1786,
            },
          },
        ],
      },
      derivativesStatus: {
        state: 'ready',
        source: 'binance-futures',
      },
    }, false);

    const fundingCard = cards.find((card) => card.label === '펀딩비');
    expect(fundingCard?.kind).toBe('rows');
    if (fundingCard?.kind !== 'rows') throw new Error('펀딩비 카드가 행 카드로 렌더링되지 않음');
    expect(fundingCard.rows[0]?.value).toBe('-0.0028%');
    expect(fundingCard.rows[1]?.value).toBe('+0.0041%');
    expect(fundingCard.rows[0]?.exchange).toBe('Binance');
  });

  it('shows both long and short account percentages in the long/short ratio card', async () => {
    const { buildTickerCards } = await import('@/components/trades/TradeSidePanel');

    const cards = buildTickerCards({
      fearGreed: { value: 40, classification: 'Fear' },
      btcDominance: 51.25,
      btcPrice: 91_500,
      btcChange24h: -2.35,
      totalMarketCap: 2_700_000_000_000,
      derivatives: {
        asset: 'BTC',
        symbol: 'BTCUSDT',
        exchange: 'Binance',
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
    }, false);

    const longShortCard = cards.find((card) => card.label === '롱/숏 비율');
    expect(longShortCard?.kind).toBe('rows');
    if (longShortCard?.kind !== 'rows') throw new Error('롱/숏 비율 카드가 행 카드로 렌더링되지 않음');
    expect(longShortCard.rows[0]?.detail).toBe('롱 42.4% / 숏 57.6%');
  });

  it('keeps a safe open interest label for legacy derivatives without asset metadata', async () => {
    const { buildTickerCards } = await import('@/components/trades/TradeSidePanel');

    const cards = buildTickerCards({
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
    }, false);

    const openInterestCard = cards.find((card) => card.label === '미결제약정');
    expect(openInterestCard?.kind).toBe('single');
    if (openInterestCard?.kind !== 'single') throw new Error('미결제약정 카드가 단일 카드로 렌더링되지 않음');
    expect(openInterestCard.move).toBe('BTC 선물');
  });
});
