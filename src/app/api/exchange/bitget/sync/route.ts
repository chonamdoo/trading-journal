import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { RATE_LIMITS } from '@/lib/api/rate-limit';
import { decryptSecret, type EncryptedSecret } from '@/lib/exchange/crypto';
import { fetchBitgetOrderFills, type BitgetOrderFill } from '@/lib/exchange/bitget';
import type { Json, TradeInsert } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

const MAX_SYNC_DAYS = 7;
const MAX_TOTAL_SYNC_DAYS = 90;

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
  return { startTime: endTime - clampedDays * 24 * 60 * 60 * 1000, endTime };
}

function chunkRange(startTime: number, endTime: number): { startTime: number; endTime: number }[] {
  const chunks: { startTime: number; endTime: number }[] = [];
  const chunkMs = MAX_SYNC_DAYS * 24 * 60 * 60 * 1000;
  for (let cursor = startTime; cursor <= endTime; cursor += chunkMs) {
    chunks.push({ startTime: cursor, endTime: Math.min(endTime, cursor + chunkMs - 1) });
  }
  return chunks;
}

function parseNumber(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toAsset(symbol: string): string {
  return symbol.replace(/USDT$/i, '').replace(/USDC$/i, '').toUpperCase();
}

function toDirection(item: BitgetOrderFill): 'LONG' | 'SHORT' {
  const tradeSide = item.tradeSide?.toLowerCase() ?? '';
  if (tradeSide.includes('short') || tradeSide.includes('buy_single')) return 'SHORT';
  if (tradeSide.includes('long') || tradeSide.includes('sell_single')) return 'LONG';
  return item.side === 'buy' ? 'SHORT' : 'LONG';
}

function isCloseFill(item: BitgetOrderFill): boolean {
  const tradeSide = item.tradeSide?.toLowerCase() ?? '';
  return tradeSide === 'close'
    || tradeSide.includes('close')
    || tradeSide.includes('reduce')
    || tradeSide.includes('burst')
    || tradeSide.includes('delivery')
    || tradeSide.includes('adl');
}

function fillFee(item: BitgetOrderFill): number {
  if (item.fee != null) return Math.abs(parseNumber(item.fee));
  return (item.feeDetail ?? []).reduce((sum, fee) => sum + Math.abs(parseNumber(fee.totalFee)), 0);
}

interface BitgetCloseGroup {
  externalId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  fills: BitgetOrderFill[];
  firstTime: number;
  lastTime: number;
  totalQty: number;
  totalNotional: number;
  pnl: number;
  fee: number;
  feeAsset: string | null;
}

function toBreakEvenEntryPrice(direction: 'LONG' | 'SHORT', exitPrice: number, pnl: number, qty: number): number {
  if (qty <= 0 || exitPrice <= 0) return exitPrice;
  const delta = pnl / qty;
  return direction === 'LONG' ? Math.max(exitPrice - delta, 0) : Math.max(exitPrice + delta, 0);
}

function aggregateCloseFills(fills: BitgetOrderFill[]): BitgetCloseGroup[] {
  const groups = new Map<string, BitgetCloseGroup>();

  for (const fill of fills) {
    const pnl = parseNumber(fill.profit);
    if (!isCloseFill(fill) || pnl === 0) continue;

    const direction = toDirection(fill);
    const key = `${fill.symbol}:${fill.orderId}:${direction}`;
    const qty = Math.abs(parseNumber(fill.baseVolume ?? fill.size));
    const notional = Math.abs(parseNumber(fill.quoteVolume));
    const time = Number(fill.cTime);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        externalId: `bitget:${key}`,
        symbol: fill.symbol,
        direction,
        fills: [fill],
        firstTime: time,
        lastTime: time,
        totalQty: qty,
        totalNotional: notional,
        pnl,
        fee: fillFee(fill),
        feeAsset: fill.feeDetail?.[0]?.feeCoin ?? 'USDT',
      });
      continue;
    }

    current.fills.push(fill);
    current.firstTime = Math.min(current.firstTime, time);
    current.lastTime = Math.max(current.lastTime, time);
    current.totalQty += qty;
    current.totalNotional += notional;
    current.pnl += pnl;
    current.fee += fillFee(fill);
    current.feeAsset ||= fill.feeDetail?.[0]?.feeCoin ?? 'USDT';
  }

  return [...groups.values()];
}

function toTradeInsert(userId: string, group: BitgetCloseGroup): TradeInsert {
  const exitPrice = group.totalQty > 0
    ? group.totalNotional / group.totalQty
    : parseNumber(group.fills[0]?.price);
  const entryPrice = toBreakEvenEntryPrice(group.direction, exitPrice, group.pnl, group.totalQty);

  return {
    user_id: userId,
    date: new Date(group.lastTime).toISOString().slice(0, 10),
    entry_datetime: new Date(group.firstTime).toISOString(),
    exit_datetime: new Date(group.lastTime).toISOString(),
    asset: toAsset(group.symbol),
    direction: group.direction,
    leverage: 1,
    entry_price: entryPrice,
    exit_price: exitPrice,
    margin: group.totalNotional > 0 ? group.totalNotional : Math.abs(group.pnl),
    status: 'closed',
    pnl: group.pnl,
    reason: null,
    notes: 'Bitget 공식 order fills close 체결을 주문 단위로 집계한 초안입니다. API 응답에 실제 진입 시각/평균 진입가가 없어 실현손익 기준 break-even 진입가로 저장했습니다. 진입 근거와 수치를 확인해 보완하세요.',
    exchange: 'bitget',
    external_id: group.externalId,
    source: 'api',
    fee: group.fee,
    fee_asset: group.feeAsset,
    synced_at: new Date().toISOString(),
    import_status: 'draft',
    raw_exchange_payload: {
      aggregate: {
        externalId: group.externalId,
        fillCount: group.fills.length,
        totalQty: group.totalQty,
        totalNotional: group.totalNotional,
      },
      fills: group.fills,
    } as unknown as Json,
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
      .select('id, api_key_encrypted, api_secret_encrypted, passphrase_encrypted')
      .eq('exchange', 'bitget')
      .eq('is_active', true)
      .single();

    if (connectionError || !connection || !connection.passphrase_encrypted) {
      return NextResponse.json({ error: '활성화된 Bitget 연결을 찾을 수 없습니다.' }, { status: 400 });
    }

    let apiKey: string;
    let apiSecret: string;
    let passphrase: string;
    try {
      apiKey = decryptSecret(connection.api_key_encrypted as unknown as EncryptedSecret, { userId, exchange: 'bitget', field: 'api_key' });
      apiSecret = decryptSecret(connection.api_secret_encrypted as unknown as EncryptedSecret, { userId, exchange: 'bitget', field: 'api_secret' });
      passphrase = decryptSecret(connection.passphrase_encrypted as unknown as EncryptedSecret, { userId, exchange: 'bitget', field: 'passphrase' });
    } catch {
      return NextResponse.json({ error: 'Bitget 연결 정보를 복호화하지 못했습니다. 다시 연결해주세요.' }, { status: 500 });
    }

    let fills: BitgetOrderFill[];
    try {
      const groups = await Promise.all(chunkRange(startTime, endTime).map((chunk) => fetchBitgetOrderFills({
        apiKey,
        apiSecret,
        passphrase,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      })));
      fills = groups.flat();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Bitget sync error';
      console.warn('Bitget order fills sync failed', { reason: message });
      return NextResponse.json({ error: 'Bitget 거래 내역을 가져오지 못했습니다.' }, { status: 400 });
    }

    const closeGroups = aggregateCloseFills(fills);
    const drafts = closeGroups.map((group) => toTradeInsert(userId, group));
    const externalIds = drafts.map((trade) => trade.external_id).filter(Boolean) as string[];
    const { data: existingRows, error: existingError } = externalIds.length > 0
      ? await supabase.from('trades').select('external_id').eq('exchange', 'bitget').in('external_id', externalIds)
      : { data: [], error: null };

    if (existingError) {
      return NextResponse.json({ error: '기존 Bitget 동기화 내역을 확인하지 못했습니다.' }, { status: 500 });
    }

    const existingIds = new Set((existingRows ?? []).map((row) => row.external_id).filter(Boolean));
    const newTrades = drafts.filter((trade) => trade.external_id && !existingIds.has(trade.external_id));

    if (newTrades.length > 0) {
      const { error: insertError } = await supabase.from('trades').insert(newTrades);
      if (insertError) {
        console.error('Bitget imported trade insert failed', insertError);
        return NextResponse.json({ error: 'Bitget 거래 초안을 저장하지 못했습니다.' }, { status: 500 });
      }
    }

    await supabase.from('exchange_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id);

    return NextResponse.json({
      success: true,
      data: {
        from: new Date(startTime).toISOString(),
        to: new Date(endTime).toISOString(),
        found: drafts.length,
        imported: newTrades.length,
        skipped: drafts.length - newTrades.length,
      },
    });
  }, RATE_LIMITS.exchange);
}
