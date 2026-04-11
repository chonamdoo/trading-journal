import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTradeById, updateTrade, deleteTrade } from '@/lib/api/trades';
import type { TradeUpdate } from '@/lib/supabase/types';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getTradeById(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const body = await req.json() as TradeUpdate;
    const result = await updateTrade(supabase, id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deleteTrade(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
