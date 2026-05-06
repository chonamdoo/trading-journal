import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/api/auth', () => ({
  withAuth: async () => Response.json({ legacy: true }),
}));
vi.mock('@/lib/api/trades', () => ({
  createTrade: vi.fn(),
  deleteTrade: vi.fn(),
  getTradeById: vi.fn(),
  getTrades: vi.fn(),
  updateTrade: vi.fn(),
}));
vi.mock('@/lib/api/deposits', () => ({
  createDeposit: vi.fn(),
  getDeposits: vi.fn(),
}));
vi.mock('@/lib/api/tradeCloses', () => ({
  addTradeClose: vi.fn(),
  getTradeCloses: vi.fn(),
}));
vi.mock('@/lib/api/tradeScaleIns', () => ({
  addTradeScaleIn: vi.fn(),
  getTradeScaleIns: vi.fn(),
}));
vi.mock('@/features/user-profile/di.server', () => ({
  createUserProfileCompositionRoot: vi.fn(),
}));
vi.mock('@/features/user-profile/presentation/mappers/user-profile-request.mapper', () => ({
  mapProfileUpdateRequest: vi.fn(),
}));
vi.mock('@/features/user-profile/presentation/mappers/user-profile-response.mapper', () => ({
  mapUserProfileToProfileResponse: vi.fn(),
}));

import * as mobileDepositsRoute from '@/app/api/mobile/deposits/route';
import * as mobileProfileRoute from '@/app/api/mobile/profile/route';
import * as mobileTradeClosesRoute from '@/app/api/mobile/trades/[id]/closes/route';
import * as mobileTradeScaleInsRoute from '@/app/api/mobile/trades/[id]/scale-ins/route';
import * as mobileTradeByIdRoute from '@/app/api/mobile/trades/[id]/route';
import * as mobileTradesRoute from '@/app/api/mobile/trades/route';

async function expectPermanentRedirect(
  response: Response,
  target: string,
) {
  expect(response.status).toBe(308);
  expect(response.headers.get('location')).toBe(target);
}

describe('/api/mobile compatibility redirects', () => {
  it('redirects mobile trades collection requests to /api/trades', async () => {
    const getResponse = await mobileTradesRoute.GET(
      new NextRequest('http://localhost/api/mobile/trades?page=2'),
    );
    const postResponse = await mobileTradesRoute.POST(
      new NextRequest('http://localhost/api/mobile/trades', { method: 'POST' }),
    );

    await expectPermanentRedirect(getResponse, 'http://localhost/api/trades?page=2');
    await expectPermanentRedirect(postResponse, 'http://localhost/api/trades');
  });

  it('redirects mobile trade detail requests to /api/trades/[id]', async () => {
    const params = { params: Promise.resolve({ id: 'trade-1' }) };

    await expectPermanentRedirect(
      await mobileTradeByIdRoute.GET(new NextRequest('http://localhost/api/mobile/trades/trade-1'), params),
      'http://localhost/api/trades/trade-1',
    );
    await expectPermanentRedirect(
      await mobileTradeByIdRoute.PUT(new NextRequest('http://localhost/api/mobile/trades/trade-1', { method: 'PUT' }), params),
      'http://localhost/api/trades/trade-1',
    );
    await expectPermanentRedirect(
      await mobileTradeByIdRoute.DELETE(new NextRequest('http://localhost/api/mobile/trades/trade-1', { method: 'DELETE' }), params),
      'http://localhost/api/trades/trade-1',
    );
  });

  it('redirects mobile trade lifecycle child routes', async () => {
    const params = { params: Promise.resolve({ id: 'trade-1' }) };

    await expectPermanentRedirect(
      await mobileTradeClosesRoute.GET(new NextRequest('http://localhost/api/mobile/trades/trade-1/closes'), params),
      'http://localhost/api/trades/trade-1/closes',
    );
    await expectPermanentRedirect(
      await mobileTradeClosesRoute.POST(new NextRequest('http://localhost/api/mobile/trades/trade-1/closes', { method: 'POST' }), params),
      'http://localhost/api/trades/trade-1/closes',
    );
    await expectPermanentRedirect(
      await mobileTradeScaleInsRoute.GET(new NextRequest('http://localhost/api/mobile/trades/trade-1/scale-ins'), params),
      'http://localhost/api/trades/trade-1/scale-ins',
    );
    await expectPermanentRedirect(
      await mobileTradeScaleInsRoute.POST(new NextRequest('http://localhost/api/mobile/trades/trade-1/scale-ins', { method: 'POST' }), params),
      'http://localhost/api/trades/trade-1/scale-ins',
    );
  });

  it('redirects mobile deposits and profile routes', async () => {
    await expectPermanentRedirect(
      await mobileDepositsRoute.GET(new NextRequest('http://localhost/api/mobile/deposits')),
      'http://localhost/api/deposits',
    );
    await expectPermanentRedirect(
      await mobileDepositsRoute.POST(new NextRequest('http://localhost/api/mobile/deposits', { method: 'POST' })),
      'http://localhost/api/deposits',
    );
    await expectPermanentRedirect(
      await mobileProfileRoute.GET(new NextRequest('http://localhost/api/mobile/profile')),
      'http://localhost/api/profile',
    );
    await expectPermanentRedirect(
      await mobileProfileRoute.PUT(new NextRequest('http://localhost/api/mobile/profile', { method: 'PUT' })),
      'http://localhost/api/profile',
    );
  });
});
