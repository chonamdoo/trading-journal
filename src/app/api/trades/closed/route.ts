import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTrades } from '@/lib/api/trades';
import type { TradeDirection, TradeFilterParams } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const filters: TradeFilterParams = { status: 'closed' };
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const asset = searchParams.get('asset');
    const direction = searchParams.get('direction');
    const result = searchParams.get('result');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const includeExpiredDrafts = searchParams.get('includeExpiredDrafts');

    if (page) filters.page = Number(page);
    if (pageSize) filters.pageSize = Number(pageSize);
    if (asset) filters.asset = asset;
    if (direction) filters.direction = direction as TradeDirection;
    if (result) filters.result = result as TradeFilterParams['result'];
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (includeExpiredDrafts === 'true') filters.includeExpiredDrafts = true;

    const apiResult = await getTrades(supabase, userId, filters);
    if (!apiResult.success) {
      return NextResponse.json({ error: apiResult.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: apiResult.data });
  });
}
