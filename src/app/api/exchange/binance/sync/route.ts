import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { RATE_LIMITS } from '@/lib/api/rate-limit';
import { decryptSecret, type EncryptedSecret } from '@/lib/exchange/crypto';
import {
  fetchBinanceRealizedPnlIncomes,
  fetchBinanceUserTrades,
  type BinanceUserTrade,
} from '@/lib/exchange/binance';
import type { Json, TradeDirection, TradeInsert } from '@/lib/supabase/types';
import { mapImportedTradeSourceToTradeInsertSource } from '@/features/exchange-import/data/mappers/imported-trade.mapper';

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

const MAX_SYNC_DAYS = 7;
const MAX_TOTAL_SYNC_DAYS = 90;
const QUOTE_ASSETS = ['USDT', 'USDC', 'BUSD'];

interface SyncRequestBody {
  days?: number;
  from?: string;
  to?: string;
}

interface PositionState {
  signedQty: number;
  avgEntryPrice: number;
  entryNotional: number;
  entryTime: number;
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

function parseNumber(value: string | number | undefined, fallback = 0): number {
  if (value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toAsset(symbol: string): string {
  for (const quote of QUOTE_ASSETS) {
    if (symbol.endsWith(quote)) {
      return symbol.slice(0, -quote.length);
    }
  }
  return symbol;
}

function signedTradeQty(trade: BinanceUserTrade): number {
  const qty = parseNumber(trade.qty);
  return trade.side === 'BUY' ? qty : -qty;
}

function toDirection(signedQty: number): TradeDirection {
  return signedQty >= 0 ? 'LONG' : 'SHORT';
}

function makeExternalId(trade: BinanceUserTrade): string {
  return `binance:${trade.symbol}:${trade.positionSide}:${trade.orderId}:${trade.id}`;
}

function makeDraftTrade(userId: string, trade: BinanceUserTrade, state: PositionState, closeQty: number): TradeInsert {
  const closeRatio = closeQty / Math.abs(state.signedQty);
  const margin = Math.max(state.entryNotional * closeRatio, Math.abs(parseNumber(trade.quoteQty)));
  const commission = parseNumber(trade.commission);
  const direction = toDirection(state.signedQty);

  return {
    user_id: userId,
    date: new Date(trade.time).toISOString().slice(0, 10),
    entry_datetime: new Date(state.entryTime).toISOString(),
    exit_datetime: new Date(trade.time).toISOString(),
    asset: toAsset(trade.symbol),
    direction,
    leverage: 1,
    entry_price: state.avgEntryPrice,
    exit_price: parseNumber(trade.price),
    margin,
    status: 'closed',
    pnl: parseNumber(trade.realizedPnl),
    reason: null,
    notes: 'Binance USD-M Futures 공식 userTrades 기반으로 자동 가져온 초안입니다. Binance 체결 응답에는 과거 레버리지/초기 증거금이 없어 x1, 진입 명목가 기준으로 저장했습니다. 진입 근거와 수치를 확인해 보완하세요.',
    exchange: 'binance',
    external_id: makeExternalId(trade),
    source: mapImportedTradeSourceToTradeInsertSource('exchange'),
    fee: commission,
    fee_asset: trade.commissionAsset || null,
    synced_at: new Date().toISOString(),
    import_status: 'draft',
    raw_exchange_payload: trade as unknown as Json,
  };
}

function reconstructClosedTrades(userId: string, trades: BinanceUserTrade[]): TradeInsert[] {
  const states = new Map<string, PositionState>();
  const drafts: TradeInsert[] = [];

  for (const trade of trades.sort((a, b) => a.time - b.time || a.id - b.id)) {
    const key = `${trade.symbol}:${trade.positionSide}`;
    const delta = signedTradeQty(trade);
    const qty = Math.abs(delta);
    const price = parseNumber(trade.price);
    const quoteQty = Math.abs(parseNumber(trade.quoteQty));
    const realizedPnl = parseNumber(trade.realizedPnl);
    const state = states.get(key);

    if (!state || state.signedQty === 0 || Math.sign(state.signedQty) === Math.sign(delta)) {
      const currentQty = state ? Math.abs(state.signedQty) : 0;
      const currentNotional = state?.entryNotional ?? 0;
      const nextQty = currentQty + qty;
      states.set(key, {
        signedQty: (state?.signedQty ?? 0) + delta,
        avgEntryPrice: nextQty > 0 ? ((state?.avgEntryPrice ?? 0) * currentQty + price * qty) / nextQty : price,
        entryNotional: currentNotional + quoteQty,
        entryTime: state?.entryTime ?? trade.time,
      });
      continue;
    }

    const closeQty = Math.min(Math.abs(state.signedQty), qty);
    if (realizedPnl !== 0) {
      drafts.push(makeDraftTrade(userId, trade, state, closeQty));
    }

    const remainingStateQty = Math.abs(state.signedQty) - closeQty;
    if (remainingStateQty > 0) {
      states.set(key, {
        signedQty: Math.sign(state.signedQty) * remainingStateQty,
        avgEntryPrice: state.avgEntryPrice,
        entryNotional: state.entryNotional * (remainingStateQty / Math.abs(state.signedQty)),
        entryTime: state.entryTime,
      });
      continue;
    }

    const flippedQty = qty - closeQty;
    if (flippedQty > 0) {
      states.set(key, {
        signedQty: Math.sign(delta) * flippedQty,
        avgEntryPrice: price,
        entryNotional: quoteQty * (flippedQty / qty),
        entryTime: trade.time,
      });
    } else {
      states.delete(key);
    }
  }

  return drafts;
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
      .eq('exchange', 'binance')
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json({ error: '활성화된 Binance 연결을 찾을 수 없습니다.' }, { status: 400 });
    }

    let apiKey: string;
    let apiSecret: string;
    try {
      apiKey = decryptSecret(connection.api_key_encrypted as unknown as EncryptedSecret, {
        userId,
        exchange: 'binance',
        field: 'api_key',
      });
      apiSecret = decryptSecret(connection.api_secret_encrypted as unknown as EncryptedSecret, {
        userId,
        exchange: 'binance',
        field: 'api_secret',
      });
    } catch (error) {
      console.error('Binance credential decrypt failed', {
        connectionId: connection.id,
        message: error instanceof Error ? error.message : 'Unknown decrypt error',
      });
      return NextResponse.json({ error: 'Binance 연결 정보를 복호화하지 못했습니다. 다시 연결해주세요.' }, { status: 500 });
    }

    let symbols: string[];
    let userTrades: BinanceUserTrade[];
    try {
      const realizedPnlGroups = await Promise.all(chunkRange(startTime, endTime).map((chunk) => fetchBinanceRealizedPnlIncomes({
        apiKey,
        apiSecret,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      })));
      const realizedPnlIncomes = realizedPnlGroups.flat();
      symbols = [...new Set(realizedPnlIncomes.map((income) => income.symbol).filter(Boolean))];
      const tradeGroups = await Promise.all(symbols.flatMap((symbol) => chunkRange(startTime, endTime).map((chunk) => fetchBinanceUserTrades({
        apiKey,
        apiSecret,
        symbol,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      }))));
      userTrades = tradeGroups.flat();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Binance sync error';
      console.warn('Binance trade sync failed', { reason: message });
      return NextResponse.json({ error: 'Binance 거래 내역을 가져오지 못했습니다.' }, { status: 400 });
    }

    const drafts = reconstructClosedTrades(userId, userTrades);
    const externalIds = drafts.map((trade) => trade.external_id).filter(Boolean) as string[];
    const { data: existingRows, error: existingError } = externalIds.length > 0
      ? await supabase
        .from('trades')
        .select('external_id')
        .eq('exchange', 'binance')
        .in('external_id', externalIds)
      : { data: [], error: null };

    if (existingError) {
      return NextResponse.json({ error: '기존 Binance 동기화 내역을 확인하지 못했습니다.' }, { status: 500 });
    }

    const existingIds = new Set((existingRows ?? []).map((row) => row.external_id).filter(Boolean));
    const newTrades = drafts.filter((trade) => trade.external_id && !existingIds.has(trade.external_id));

    if (newTrades.length > 0) {
      const { error: insertError } = await supabase
        .from('trades')
        .insert(newTrades);

      if (insertError) {
        console.error('Binance imported trade insert failed', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        return NextResponse.json({ error: 'Binance 거래 초안을 저장하지 못했습니다.' }, { status: 500 });
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
        found: drafts.length,
        imported: newTrades.length,
        skipped: drafts.length - newTrades.length,
        symbols,
      },
    });
  }, RATE_LIMITS.exchange);
}
