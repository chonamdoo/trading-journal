import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { deletePlan, getPlanById, updatePlan } from '@/lib/api/plans';
import type { TradingPlanUpdate } from '@/lib/supabase/types';

type Params = { params: Promise<{ id: string }> };

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getPlanById(supabase, id);
    if (!result.success) return errorResponse(result.error, 404);
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const body = await req.json() as TradingPlanUpdate;
    const result = await updatePlan(supabase, id, body);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deletePlan(supabase, id);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true });
  });
}
