import type { Trade, TradeSource } from '../../domain/entities/trade';
import type { TradeRowDto } from '../dto/trade-row.dto';

function parseNumeric(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return num;
}

function mapTradeSource(source: TradeRowDto['source']): TradeSource | null | undefined {
  if (source === 'api') return 'exchange';
  return source;
}

export function mapTradeRowToTrade(row: TradeRowDto): Trade {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    entryDatetime: row.entry_datetime,
    exitDatetime: row.exit_datetime,
    asset: row.asset,
    positionDirection: row.direction,
    leverage: row.leverage,
    entryPrice: parseNumeric(row.entry_price) ?? 0,
    exitPrice: parseNumeric(row.exit_price),
    stopLossPrice: parseNumeric(row.stop_loss_price),
    margin: parseNumeric(row.margin) ?? 0,
    status: row.status,
    tradingPnl: parseNumeric(row.pnl),
    tradeRationale: row.reason,
    tradeReview: row.notes,
    tradeTags: row.tags,
    tradeEmotion: row.emotion,
    tradeSource: mapTradeSource(row.source),
    exchange: row.exchange,
    externalId: row.external_id,
    fee: parseNumeric(row.fee),
    feeAsset: row.fee_asset,
    syncedAt: row.synced_at,
    importStatus: row.import_status,
    rawExchangePayload: row.raw_exchange_payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
