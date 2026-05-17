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
    expect(html).toContain('Market Summary');
    expect(html).toContain('Next Events');
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

    expect(cards.find((card) => card.label === 'Funding')?.value).toBe('-0.0028%');
  });
});
