import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTrades, createTrade } from '@/lib/api/trades';
import type { TradeFilterParams, TradeInsert } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = req.nextUrl;

    const filters: TradeFilterParams = {};
    if (searchParams.get('asset')) filters.asset = searchParams.get('asset')!;
    if (searchParams.get('direction')) filters.direction = searchParams.get('direction') as TradeFilterParams['direction'];
    if (searchParams.get('status')) filters.status = searchParams.get('status') as TradeFilterParams['status'];
    if (searchParams.get('result')) filters.result = searchParams.get('result') as TradeFilterParams['result'];
    if (searchParams.get('dateFrom')) filters.dateFrom = searchParams.get('dateFrom')!;
    if (searchParams.get('dateTo')) filters.dateTo = searchParams.get('dateTo')!;
    if (searchParams.get('page')) filters.page = Number(searchParams.get('page'));
    if (searchParams.get('pageSize')) filters.pageSize = Number(searchParams.get('pageSize'));
    if (searchParams.get('includeExpiredDrafts') === 'true') filters.includeExpiredDrafts = true;

    const result = await getTrades(supabase, userId, filters);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<TradeInsert, 'user_id'>;
    const result = await createTrade(supabase, { ...body, user_id: userId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  });
}
