import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { RATE_LIMITS } from '@/lib/api/rate-limit';
import { decryptSecret, type EncryptedSecret } from '@/lib/exchange/crypto';
import { fetchBybitClosedPnl, type BybitClosedPnl } from '@/lib/exchange/bybit';
import type { Json, TradeInsert } from '@/lib/supabase/types';
import { mapImportedTradeSourceToTradeInsertSource } from '@/features/exchange-import/data/mappers/imported-trade.mapper';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

const MAX_SYNC_DAYS = 7;
const MAX_TOTAL_SYNC_DAYS = 90;
const USDT_QUOTES = ['USDT', 'USDC', 'PERP'];

interface SyncRequestBody {
  days?: number;
  from?: string;
  to?: string;
}

function resolveSyncRange(body: SyncRequestBody): { startTime: number; endTime: number } {
  if (body.from && body.to) {
    const startTime = new Date(`${body.from}T00:00:00.000Z`).getTime();
    const endTime = new Date(`${body.to}T23:59:59.999Z`).getTime();
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime > endTime) {
      throw new Error('유효한 동기화 기간을 입력하세요.');
    }
    const rangeDays = Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000));
    if (rangeDays > MAX_TOTAL_SYNC_DAYS) {
      throw new Error(`한 번에 요청할 수 있는 전체 기간은 최대 ${MAX_TOTAL_SYNC_DAYS}일입니다.`);
    }
    return { startTime, endTime };
  }

  const days = typeof body.days === 'number' && Number.isFinite(body.days) ? Math.floor(body.days) : MAX_SYNC_DAYS;
  const clampedDays = Math.min(Math.max(days, 1), MAX_TOTAL_SYNC_DAYS);
  const endTime = Date.now();
  return {
    startTime: endTime - clampedDays * 24 * 60 * 60 * 1000,
    endTime,
  };
}

function chunkRange(startTime: number, endTime: number): { startTime: number; endTime: number }[] {
  const chunks: { startTime: number; endTime: number }[] = [];
  const chunkMs = MAX_SYNC_DAYS * 24 * 60 * 60 * 1000;
  for (let cursor = startTime; cursor <= endTime; cursor += chunkMs) {
    chunks.push({
      startTime: cursor,
      endTime: Math.min(endTime, cursor + chunkMs - 1),
    });
  }
  return chunks;
}

function parseNumber(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toAsset(symbol: string): string {
  for (const quote of USDT_QUOTES) {
    if (symbol.endsWith(quote)) {
      return symbol.slice(0, -quote.length);
    }
  }
  return symbol;
}

function toIso(ms: string): string {
  return new Date(Number(ms)).toISOString();
}

function toDate(ms: string): string {
  return toIso(ms).slice(0, 10);
}

function toTradeInsert(userId: string, item: BybitClosedPnl): TradeInsert {
  const leverage = Math.max(parseNumber(item.leverage, 1), 1);
  const cumEntryValue = Math.abs(parseNumber(item.cumEntryValue));
  const margin = cumEntryValue > 0 ? cumEntryValue / leverage : Math.abs(parseNumber(item.closedPnl));
  const fee = parseNumber(item.openFee) + parseNumber(item.closeFee);
  const direction = item.side === 'Sell' ? 'LONG' : 'SHORT';

  return {
    user_id: userId,
    date: toDate(item.updatedTime),
    entry_datetime: toIso(item.createdTime),
    exit_datetime: toIso(item.updatedTime),
    asset: toAsset(item.symbol),
    direction,
    leverage,
    entry_price: parseNumber(item.avgEntryPrice),
    exit_price: parseNumber(item.avgExitPrice),
    margin,
    status: 'closed',
    pnl: parseNumber(item.closedPnl),
    reason: null,
    notes: 'Bybit closed PnL에서 자동 가져온 초안입니다. 진입 근거와 회고를 직접 보완하세요.',
    exchange: 'bybit',
    external_id: item.orderId,
    source: mapImportedTradeSourceToTradeInsertSource('exchange'),
    fee,
    fee_asset: fee ? 'USDT' : null,
    synced_at: new Date().toISOString(),
    import_status: 'draft',
    raw_exchange_payload: item as unknown as Json,
  };
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const body = await req.json().catch(() => ({})) as SyncRequestBody;
    let range: { startTime: number; endTime: number };
    try {
      range = resolveSyncRange(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : '유효한 동기화 기간을 입력하세요.';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { startTime, endTime } = range;

    const { data: connection, error: connectionError } = await supabase
      .from('exchange_connections')
      .select('id, api_key_encrypted, api_secret_encrypted')
      .eq('exchange', 'bybit')
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json({ error: '활성화된 Bybit 연결을 찾을 수 없습니다.' }, { status: 400 });
    }

    let apiKey: string;
    let apiSecret: string;
    try {
      apiKey = decryptSecret(connection.api_key_encrypted as unknown as EncryptedSecret, {
        userId,
        exchange: 'bybit',
        field: 'api_key',
      });
      apiSecret = decryptSecret(connection.api_secret_encrypted as unknown as EncryptedSecret, {
        userId,
        exchange: 'bybit',
        field: 'api_secret',
      });
    } catch (error) {
      console.error('Bybit credential decrypt failed', {
        connectionId: connection.id,
        message: error instanceof Error ? error.message : 'Unknown decrypt error',
      });
      return NextResponse.json({ error: 'Bybit 연결 정보를 복호화하지 못했습니다. 다시 연결해주세요.' }, { status: 500 });
    }

    let closedPnls: BybitClosedPnl[];
    try {
      const chunkResults = await Promise.all(chunkRange(startTime, endTime).map((chunk) => fetchBybitClosedPnl({
        apiKey,
        apiSecret,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      })));
      closedPnls = chunkResults.flat();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Bybit sync error';
      console.warn('Bybit closed PnL sync failed', { reason: message });
      return NextResponse.json({ error: 'Bybit 거래 내역을 가져오지 못했습니다.' }, { status: 400 });
    }

    const externalIds = closedPnls.map((item) => item.orderId).filter(Boolean);
    const { data: existingRows, error: existingError } = externalIds.length > 0
      ? await supabase
        .from('trades')
        .select('external_id')
        .eq('exchange', 'bybit')
        .in('external_id', externalIds)
      : { data: [], error: null };

    if (existingError) {
      return NextResponse.json({ error: '기존 동기화 내역을 확인하지 못했습니다.' }, { status: 500 });
    }

    const existingIds = new Set((existingRows ?? []).map((row) => row.external_id).filter(Boolean));
    const newTrades = closedPnls
      .filter((item) => item.orderId && !existingIds.has(item.orderId))
      .map((item) => toTradeInsert(userId, item));

    if (newTrades.length > 0) {
      const { error: insertError } = await supabase
        .from('trades')
        .insert(newTrades);

      if (insertError) {
        console.error('Bybit imported trade insert failed', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        return NextResponse.json({ error: 'Bybit 거래 초안을 저장하지 못했습니다.' }, { status: 500 });
      }
    }

    await supabase
      .from('exchange_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    return NextResponse.json({
      success: true,
      data: {
        from: new Date(startTime).toISOString(),
        to: new Date(endTime).toISOString(),
        found: closedPnls.length,
        imported: newTrades.length,
        skipped: closedPnls.length - newTrades.length,
      },
    });
  }, RATE_LIMITS.exchange);
}
