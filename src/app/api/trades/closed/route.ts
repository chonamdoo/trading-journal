import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { getTrades } from '@/lib/api/trades';
import type { TradeDirection, TradeFilterParams } from '@/lib/supabase/types';

const tradeDirections: TradeDirection[] = ['LONG', 'SHORT'];
const tradeResults: Array<NonNullable<TradeFilterParams['result']>> = ['profit', 'loss'];

function parsePositiveInt(value: string, field: string): { value: number } | { error: NextResponse } {
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return { error: NextResponse.json({ error: `Invalid ${field}` }, { status: 400 }) };
  }
  return { value: parsedValue };
}

function isTradeDirection(value: string): value is TradeDirection {
  return tradeDirections.includes(value as TradeDirection);
}

function isTradeResult(value: string): value is NonNullable<TradeFilterParams['result']> {
  return tradeResults.includes(value as NonNullable<TradeFilterParams['result']>);
}

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

    if (page) {
      const parsedPage = parsePositiveInt(page, 'page');
      if ('error' in parsedPage) return parsedPage.error;
      filters.page = parsedPage.value;
    }
    if (pageSize) {
      const parsedPageSize = parsePositiveInt(pageSize, 'pageSize');
      if ('error' in parsedPageSize) return parsedPageSize.error;
      filters.pageSize = parsedPageSize.value;
    }
    if (asset) filters.asset = asset;
    if (direction) {
      if (!isTradeDirection(direction)) {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
      }
      filters.direction = direction;
    }
    if (result) {
      if (!isTradeResult(result)) {
        return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
      }
      filters.result = result;
    }
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
