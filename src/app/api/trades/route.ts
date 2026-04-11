import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTrades, createTrade } from '@/lib/api/trades';
import type { TradeFilterParams, TradeInsert, TradeDirection, TradeStatus } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);

    const filters: TradeFilterParams = {};
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const asset = searchParams.get('asset');
    const direction = searchParams.get('direction');
    const status = searchParams.get('status');
    const result = searchParams.get('result');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (page) filters.page = Number(page);
    if (pageSize) filters.pageSize = Number(pageSize);
    if (asset) filters.asset = asset;
    if (direction) filters.direction = direction as TradeDirection;
    if (status) filters.status = status as TradeStatus;
    if (result) filters.result = result as TradeFilterParams['result'];
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const apiResult = await getTrades(supabase, userId, filters);
    if (!apiResult.success) {
      return NextResponse.json({ error: apiResult.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: apiResult.data });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json() as Omit<TradeInsert, 'user_id'>;
    const result = await createTrade(supabase, { ...body, user_id: userId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  });
}
