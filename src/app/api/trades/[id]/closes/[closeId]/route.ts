import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { deleteTradeClose } from '@/lib/api/tradeCloses';

type Params = { params: Promise<{ id: string; closeId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { closeId } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deleteTradeClose(supabase, closeId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
