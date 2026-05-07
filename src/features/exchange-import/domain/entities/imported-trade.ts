export type ExchangeName = 'binance' | 'bybit' | 'okx' | 'bitget';

export type ImportedTradeSource = 'exchange';

export type TradeSource = 'manual' | 'exchange' | 'csv';

export type LegacyTradeInsertSource = 'manual' | 'api' | 'csv';

export type ImportStatus = 'draft' | 'confirmed';

export type ImportedTrade = {
  exchange: ExchangeName;
  externalId: string;
  tradeSource: ImportedTradeSource;
  importStatus: ImportStatus;
};

export function createImportedTrade(importedTrade: ImportedTrade): ImportedTrade {
  return importedTrade;
}

export function mapTradeSourceForPersistence(source: TradeSource): LegacyTradeInsertSource {
  if (source === 'exchange') return 'api';
  return source;
}
