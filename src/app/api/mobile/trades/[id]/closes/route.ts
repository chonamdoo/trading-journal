import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/mobile-auth';
import { getTradeCloses, addTradeClose } from '@/lib/api/tradeCloses';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    const result = await getTradeCloses(supabase, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}

export async function POST(req: NextRequest, { params }: Params) {
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
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
