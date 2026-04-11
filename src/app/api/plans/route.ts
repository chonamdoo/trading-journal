import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getPlans, createPlan, getPlanByTradeId } from '@/lib/api/plans';
import type { TradingPlanInsert, PlanStatusDb } from '@/lib/supabase/types';
import type { PlanFilterParams } from '@/lib/api/plans';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);

    // 거래 연결 플랜 조회 (linkedTradeId 파라미터)
    const linkedTradeId = searchParams.get('linkedTradeId');
    if (linkedTradeId) {
      const result = await getPlanByTradeId(supabase, linkedTradeId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    const filters: PlanFilterParams = {};
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const status = searchParams.get('status');
    const asset = searchParams.get('asset');

    if (page) filters.page = Number(page);
    if (pageSize) filters.pageSize = Number(pageSize);
    if (status) filters.status = status as PlanStatusDb;
    if (asset) filters.asset = asset;

    const result = await getPlans(supabase, userId, filters);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<TradingPlanInsert, 'user_id'>;
    const result = await createPlan(supabase, { ...body, user_id: userId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
