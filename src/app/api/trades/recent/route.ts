import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getRecentTrades } from '@/lib/api/trades';

const MAX_RECENT_TRADES_LIMIT = 100;

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    let limit: number | undefined;

    if (limitParam !== null) {
      const parsedLimit = Number(limitParam);
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
      }
      limit = Math.min(parsedLimit, MAX_RECENT_TRADES_LIMIT);
    }

    const result = await getRecentTrades(supabase, userId, limit);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  });
}
