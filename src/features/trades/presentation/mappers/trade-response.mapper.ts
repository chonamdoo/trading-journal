import type { Trade } from '../../domain/entities/trade';

function mapTradeSourceToLegacy(source: Trade['tradeSource']): 'manual' | 'api' | 'csv' | null {
  if (source === 'exchange') return 'api';
  return source ?? null;
}

export function mapTradeToLegacyResponse(trade: Trade) {
  return {
    id: trade.id,
    user_id: trade.userId,
    date: trade.date,
    entry_datetime: trade.entryDatetime,
    exit_datetime: trade.exitDatetime,
    asset: trade.asset,
    direction: trade.positionDirection,
    leverage: trade.leverage,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    stop_loss_price: trade.stopLossPrice,
    margin: trade.margin,
    status: trade.status,
    pnl: trade.tradingPnl,
    reason: trade.tradeRationale,
    notes: trade.tradeReview,
    tags: trade.tradeTags,
    emotion: trade.tradeEmotion,
    exchange: trade.exchange,
    external_id: trade.externalId,
    source: mapTradeSourceToLegacy(trade.tradeSource),
    fee: trade.fee,
    funding_fee: trade.fundingFee ?? 0,
    fee_asset: trade.feeAsset,
    synced_at: trade.syncedAt,
    import_status: trade.importStatus,
    raw_exchange_payload: trade.rawExchangePayload,
    created_at: trade.createdAt,
    updated_at: trade.updatedAt,
  };
}
