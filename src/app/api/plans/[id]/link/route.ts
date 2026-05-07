import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { linkPlanToTrade, unlinkPlan } from '@/lib/api/plans';

type Params = { params: Promise<{ id: string }> };

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const body = await req.json() as { tradeId?: string };
    if (!body.tradeId) return errorResponse('tradeId is required');

    const result = await linkPlanToTrade(supabase, id, body.tradeId);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await unlinkPlan(supabase, id);
    if (!result.success) return errorResponse(result.error);
    return NextResponse.json({ success: true, data: result.data });
  });
}
