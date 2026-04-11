import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTradeCloses, addTradeClose } from '@/lib/api/tradeCloses';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getTradeCloses(supabase, id);
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
      exitPrice: number;
      exitDatetime: string;
      quantityPct: number;
      closeMargin?: number | null;
      pnl: number;
    };
    const result = await addTradeClose(supabase, {
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
