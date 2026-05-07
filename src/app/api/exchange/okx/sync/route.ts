import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { RATE_LIMITS } from '@/lib/api/rate-limit';
import { decryptSecret, type EncryptedSecret } from '@/lib/exchange/crypto';
import { fetchOkxSwapFillsHistory, type OkxFillHistory } from '@/lib/exchange/okx';
import type { Json, TradeInsert } from '@/lib/supabase/types';
import { mapImportedTradeSourceToTradeInsertSource } from '@/features/exchange-import/data/mappers/imported-trade.mapper';

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
  return {
    startTime: endTime - clampedDays * 24 * 60 * 60 * 1000,
    endTime,
  };
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

function toAsset(instId: string): string {
  return instId.split('-')[0] || instId;
}

function toDirection(item: OkxFillHistory): 'LONG' | 'SHORT' {
  if (item.posSide === 'long') return 'LONG';
  if (item.posSide === 'short') return 'SHORT';
  return item.side === 'sell' ? 'LONG' : 'SHORT';
}

interface OkxCloseGroup {
  externalId: string;
  instId: string;
  direction: 'LONG' | 'SHORT';
  leverage: number;
  fills: OkxFillHistory[];
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

function aggregateCloseFills(fills: OkxFillHistory[]): OkxCloseGroup[] {
  const groups = new Map<string, OkxCloseGroup>();

  for (const fill of fills) {
    const pnl = parseNumber(fill.fillPnl);
    if (pnl === 0) continue;

    const key = `${fill.instId}:${fill.ordId}:${fill.posSide}`;
    const qty = Math.abs(parseNumber(fill.fillSz));
    const price = parseNumber(fill.fillPx);
    const notional = qty * price;
    const time = Number(fill.fillTime);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        externalId: `okx:${key}`,
        instId: fill.instId,
        direction: toDirection(fill),
        leverage: Math.max(Math.floor(parseNumber(fill.lever, 1)), 1),
        fills: [fill],
        firstTime: time,
        lastTime: time,
        totalQty: qty,
        totalNotional: notional,
        pnl,
        fee: parseNumber(fill.fee),
        feeAsset: fill.feeCcy || null,
      });
      continue;
    }

    current.fills.push(fill);
    current.firstTime = Math.min(current.firstTime, time);
    current.lastTime = Math.max(current.lastTime, time);
    current.totalQty += qty;
    current.totalNotional += notional;
    current.pnl += pnl;
    current.fee += parseNumber(fill.fee);
    current.feeAsset ||= fill.feeCcy || null;
  }

  return [...groups.values()];
}

function toTradeInsert(userId: string, group: OkxCloseGroup): TradeInsert {
  const exitPrice = group.totalQty > 0 ? group.totalNotional / group.totalQty : 0;
  const entryPrice = toBreakEvenEntryPrice(group.direction, exitPrice, group.pnl, group.totalQty);

  return {
    user_id: userId,
    date: new Date(group.lastTime).toISOString().slice(0, 10),
    entry_datetime: new Date(group.firstTime).toISOString(),
    exit_datetime: new Date(group.lastTime).toISOString(),
    asset: toAsset(group.instId),
    direction: group.direction,
    leverage: group.leverage,
    entry_price: entryPrice,
    exit_price: exitPrice,
    margin: group.totalNotional > 0 ? group.totalNotional / group.leverage : Math.abs(group.pnl),
    status: 'closed',
    pnl: group.pnl,
    reason: null,
    notes: 'OKX 공식 fills-history close 체결을 주문 단위로 집계한 초안입니다. API 응답에 실제 진입 시각/평균 진입가가 없어 실현손익 기준 break-even 진입가로 저장했습니다. 진입 근거와 수치를 확인해 보완하세요.',
    exchange: 'okx',
    external_id: group.externalId,
    source: mapImportedTradeSourceToTradeInsertSource('exchange'),
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
      .eq('exchange', 'okx')
      .eq('is_active', true)
      .single();

    if (connectionError || !connection || !connection.passphrase_encrypted) {
      return NextResponse.json({ error: '활성화된 OKX 연결을 찾을 수 없습니다.' }, { status: 400 });
    }

    let apiKey: string;
    let apiSecret: string;
    let passphrase: string;
    try {
      apiKey = decryptSecret(connection.api_key_encrypted as unknown as EncryptedSecret, { userId, exchange: 'okx', field: 'api_key' });
      apiSecret = decryptSecret(connection.api_secret_encrypted as unknown as EncryptedSecret, { userId, exchange: 'okx', field: 'api_secret' });
      passphrase = decryptSecret(connection.passphrase_encrypted as unknown as EncryptedSecret, { userId, exchange: 'okx', field: 'passphrase' });
    } catch {
      return NextResponse.json({ error: 'OKX 연결 정보를 복호화하지 못했습니다. 다시 연결해주세요.' }, { status: 500 });
    }

    let fills: OkxFillHistory[];
    try {
      const groups = await Promise.all(chunkRange(startTime, endTime).map((chunk) => fetchOkxSwapFillsHistory({
        apiKey,
        apiSecret,
        passphrase,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      })));
      fills = groups.flat();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OKX sync error';
      console.warn('OKX fills-history sync failed', { reason: message });
      return NextResponse.json({ error: 'OKX 거래 내역을 가져오지 못했습니다.' }, { status: 400 });
    }

    const closeGroups = aggregateCloseFills(fills);
    const drafts = closeGroups.map((group) => toTradeInsert(userId, group));
    const externalIds = drafts.map((trade) => trade.external_id).filter(Boolean) as string[];
    const { data: existingRows, error: existingError } = externalIds.length > 0
      ? await supabase.from('trades').select('external_id').eq('exchange', 'okx').in('external_id', externalIds)
      : { data: [], error: null };

    if (existingError) {
      return NextResponse.json({ error: '기존 OKX 동기화 내역을 확인하지 못했습니다.' }, { status: 500 });
    }

    const existingIds = new Set((existingRows ?? []).map((row) => row.external_id).filter(Boolean));
    const newTrades = drafts.filter((trade) => trade.external_id && !existingIds.has(trade.external_id));

    if (newTrades.length > 0) {
      const { error: insertError } = await supabase.from('trades').insert(newTrades);
      if (insertError) {
        console.error('OKX imported trade insert failed', insertError);
        return NextResponse.json({ error: 'OKX 거래 초안을 저장하지 못했습니다.' }, { status: 500 });
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
