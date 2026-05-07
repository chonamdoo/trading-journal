import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TradingPlanInsert, TradingPlanRow } from '@/lib/supabase/types';

const mocks = vi.hoisted(() => {
  const plan: TradingPlanRow = {
    id: 'plan-1',
    user_id: 'user-1',
    title: 'BTC breakout',
    asset: 'BTC',
    direction: 'LONG',
    entry_conditions: 'Break above resistance',
    entry_price_min: null,
    entry_price_max: null,
    target_prices: [],
    stop_loss_price: null,
    risk_reward_ratio: null,
    position_size_plan: null,
    leverage_plan: null,
    margin_plan: null,
    confidence_level: 3,
    market_analysis: null,
    invalidation_conditions: null,
    status: 'active',
    linked_trade_id: null,
    linked_at: null,
    review_notes: null,
    plan_adherence: null,
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };

  return {
    plan,
    withAuth: vi.fn(async (_req, handler) => handler({ from: vi.fn() }, 'user-1')),
    getPlans: vi.fn(async () => ({ success: true, data: [plan] })),
    getActivePlans: vi.fn(async () => ({ success: true, data: [plan] })),
    getPlanById: vi.fn(async () => ({ success: true, data: plan })),
    createPlan: vi.fn(async () => ({ success: true, data: plan })),
    updatePlan: vi.fn(async () => ({ success: true, data: plan })),
    deletePlan: vi.fn(async () => ({ success: true, data: undefined })),
    linkPlanToTrade: vi.fn(async () => ({ success: true, data: { ...plan, status: 'linked', linked_trade_id: 'trade-1' } })),
    unlinkPlan: vi.fn(async () => ({ success: true, data: plan })),
  };
});

vi.mock('@/lib/api/auth', () => ({
  withAuth: mocks.withAuth,
}));

vi.mock('@/lib/api/plans', () => ({
  getPlans: mocks.getPlans,
  getActivePlans: mocks.getActivePlans,
  getPlanById: mocks.getPlanById,
  createPlan: mocks.createPlan,
  updatePlan: mocks.updatePlan,
  deletePlan: mocks.deletePlan,
  linkPlanToTrade: mocks.linkPlanToTrade,
  unlinkPlan: mocks.unlinkPlan,
}));

import * as activePlansRoute from '@/app/api/plans/active/route';
import * as planByIdRoute from '@/app/api/plans/[id]/route';
import * as planLinkRoute from '@/app/api/plans/[id]/link/route';
import * as plansRoute from '@/app/api/plans/route';

const params = { params: Promise.resolve({ id: 'plan-1' }) };

describe('/api/plans route boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withAuth.mockImplementation(async (_req, handler) => handler({ from: vi.fn() }, 'user-1'));
    mocks.getPlans.mockResolvedValue({ success: true, data: [mocks.plan] });
    mocks.getActivePlans.mockResolvedValue({ success: true, data: [mocks.plan] });
    mocks.getPlanById.mockResolvedValue({ success: true, data: mocks.plan });
    mocks.createPlan.mockResolvedValue({ success: true, data: mocks.plan });
    mocks.updatePlan.mockResolvedValue({ success: true, data: mocks.plan });
    mocks.deletePlan.mockResolvedValue({ success: true, data: undefined });
    mocks.linkPlanToTrade.mockResolvedValue({
      success: true,
      data: { ...mocks.plan, status: 'linked', linked_trade_id: 'trade-1' },
    });
    mocks.unlinkPlan.mockResolvedValue({ success: true, data: mocks.plan });
  });

  it('lists and creates trading plans through withAuth', async () => {
    const getResponse = await plansRoute.GET(new NextRequest('http://localhost/api/plans?status=active&asset=BTC'));
    const createBody: Omit<TradingPlanInsert, 'user_id'> = {
      title: 'BTC breakout',
      asset: 'BTC',
      direction: 'LONG',
      entry_conditions: 'Break above resistance',
    };
    const postResponse = await plansRoute.POST(new NextRequest('http://localhost/api/plans', {
      method: 'POST',
      body: JSON.stringify(createBody),
    }));

    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toEqual({ success: true, data: [mocks.plan] });
    expect(mocks.getPlans).toHaveBeenCalledWith(expect.anything(), 'user-1', {
      status: 'active',
      asset: 'BTC',
    });
    expect(postResponse.status).toBe(201);
    expect(mocks.createPlan).toHaveBeenCalledWith(expect.anything(), 'user-1', createBody);
  });

  it('reads updates and deletes a plan by id', async () => {
    const getResponse = await planByIdRoute.GET(new NextRequest('http://localhost/api/plans/plan-1'), params);
    const putResponse = await planByIdRoute.PUT(new NextRequest('http://localhost/api/plans/plan-1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated plan' }),
    }), params);
    const deleteResponse = await planByIdRoute.DELETE(new NextRequest('http://localhost/api/plans/plan-1', {
      method: 'DELETE',
    }), params);

    expect(getResponse.status).toBe(200);
    expect(putResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
    expect(mocks.getPlanById).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
    expect(mocks.updatePlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1', { title: 'Updated plan' });
    expect(mocks.deletePlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
  });

  it('lists active plans and links or unlinks a plan', async () => {
    const activeResponse = await activePlansRoute.GET(new NextRequest('http://localhost/api/plans/active'));
    const linkResponse = await planLinkRoute.POST(new NextRequest('http://localhost/api/plans/plan-1/link', {
      method: 'POST',
      body: JSON.stringify({ tradeId: 'trade-1' }),
    }), params);
    const unlinkResponse = await planLinkRoute.DELETE(new NextRequest('http://localhost/api/plans/plan-1/link', {
      method: 'DELETE',
    }), params);

    expect(activeResponse.status).toBe(200);
    expect(linkResponse.status).toBe(200);
    expect(unlinkResponse.status).toBe(200);
    expect(mocks.getActivePlans).toHaveBeenCalledWith(expect.anything(), 'user-1');
    expect(mocks.linkPlanToTrade).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1', 'trade-1');
    expect(mocks.unlinkPlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
  });

  it('rejects link requests without a trade id', async () => {
    const response = await planLinkRoute.POST(new NextRequest('http://localhost/api/plans/plan-1/link', {
      method: 'POST',
      body: JSON.stringify({}),
    }), params);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'tradeId is required' });
    expect(mocks.linkPlanToTrade).not.toHaveBeenCalled();
  });

  it('propagates upstream plan collection failures', async () => {
    mocks.getPlans.mockResolvedValueOnce({ success: false, error: 'list failed' } as never);
    mocks.createPlan.mockResolvedValueOnce({ success: false, error: 'create failed' } as never);

    const getResponse = await plansRoute.GET(new NextRequest('http://localhost/api/plans?status=active'));
    const postResponse = await plansRoute.POST(new NextRequest('http://localhost/api/plans', {
      method: 'POST',
      body: JSON.stringify({ title: 'Plan' }),
    }));

    expect(getResponse.status).toBe(400);
    expect(await getResponse.json()).toEqual({ error: 'list failed' });
    expect(mocks.getPlans).toHaveBeenCalledWith(expect.anything(), 'user-1', { status: 'active' });
    expect(postResponse.status).toBe(400);
    expect(await postResponse.json()).toEqual({ error: 'create failed' });
    expect(mocks.createPlan).toHaveBeenCalledWith(expect.anything(), 'user-1', { title: 'Plan' });
  });

  it('propagates upstream plan detail failures', async () => {
    mocks.getPlanById.mockResolvedValueOnce({ success: false, error: 'missing plan' } as never);
    mocks.updatePlan.mockResolvedValueOnce({ success: false, error: 'update failed' } as never);
    mocks.deletePlan.mockResolvedValueOnce({ success: false, error: 'delete failed' } as never);

    const getResponse = await planByIdRoute.GET(new NextRequest('http://localhost/api/plans/plan-1'), params);
    const putResponse = await planByIdRoute.PUT(new NextRequest('http://localhost/api/plans/plan-1', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated plan' }),
    }), params);
    const deleteResponse = await planByIdRoute.DELETE(new NextRequest('http://localhost/api/plans/plan-1', {
      method: 'DELETE',
    }), params);

    expect(getResponse.status).toBe(404);
    expect(await getResponse.json()).toEqual({ error: 'missing plan' });
    expect(mocks.getPlanById).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
    expect(putResponse.status).toBe(400);
    expect(await putResponse.json()).toEqual({ error: 'update failed' });
    expect(mocks.updatePlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1', { title: 'Updated plan' });
    expect(deleteResponse.status).toBe(400);
    expect(await deleteResponse.json()).toEqual({ error: 'delete failed' });
    expect(mocks.deletePlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
  });

  it('propagates upstream active and link failures', async () => {
    mocks.getActivePlans.mockResolvedValueOnce({ success: false, error: 'active failed' } as never);
    mocks.linkPlanToTrade.mockResolvedValueOnce({ success: false, error: 'link failed' } as never);
    mocks.unlinkPlan.mockResolvedValueOnce({ success: false, error: 'unlink failed' } as never);

    const activeResponse = await activePlansRoute.GET(new NextRequest('http://localhost/api/plans/active'));
    const linkResponse = await planLinkRoute.POST(new NextRequest('http://localhost/api/plans/plan-1/link', {
      method: 'POST',
      body: JSON.stringify({ tradeId: 'trade-1' }),
    }), params);
    const unlinkResponse = await planLinkRoute.DELETE(new NextRequest('http://localhost/api/plans/plan-1/link', {
      method: 'DELETE',
    }), params);

    expect(activeResponse.status).toBe(400);
    expect(await activeResponse.json()).toEqual({ error: 'active failed' });
    expect(mocks.getActivePlans).toHaveBeenCalledWith(expect.anything(), 'user-1');
    expect(linkResponse.status).toBe(400);
    expect(await linkResponse.json()).toEqual({ error: 'link failed' });
    expect(mocks.linkPlanToTrade).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1', 'trade-1');
    expect(unlinkResponse.status).toBe(400);
    expect(await unlinkResponse.json()).toEqual({ error: 'unlink failed' });
    expect(mocks.unlinkPlan).toHaveBeenCalledWith(expect.anything(), 'user-1', 'plan-1');
  });
});
