import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { deleteTradeScaleIn } from '@/lib/api/tradeScaleIns';

type Params = { params: Promise<{ id: string; scaleInId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, scaleInId } = await params;
  return withAuth(req, async (supabase) => {
    const result = await deleteTradeScaleIn(supabase, scaleInId, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  });
}
