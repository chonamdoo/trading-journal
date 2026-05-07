import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getRecentTrades } from '@/lib/api/trades';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : undefined;

    const result = await getRecentTrades(supabase, userId, limit);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
