import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTradeScaleIns, addTradeScaleIn } from '@/lib/api/tradeScaleIns';
import type { ScaleInTypeDb } from '@/lib/supabase/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getTradeScaleIns(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as {
      entryPrice: number;
      margin: number;
      quantity?: number | null;
      entryDatetime: string;
      type: ScaleInTypeDb;
      note?: string | null;
    };
    const result = await addTradeScaleIn(supabase, {
      tradeId: id,
      userId,
      ...body,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  });
}
