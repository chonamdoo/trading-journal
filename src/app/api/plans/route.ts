import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createPlan, getPlans, type PlanFilterParams } from '@/lib/api/plans';
import type { PlanStatusDb, TradingPlanInsert } from '@/lib/supabase/types';

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const status = req.nextUrl.searchParams.get('status') as PlanStatusDb | null;
    const asset = req.nextUrl.searchParams.get('asset');
    const filters: PlanFilterParams = {};
    if (status) filters.status = status;
    if (asset) filters.asset = asset;

    const result = await getPlans(supabase, userId, filters);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<TradingPlanInsert, 'user_id'>;
    const result = await createPlan(supabase, userId, body);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
