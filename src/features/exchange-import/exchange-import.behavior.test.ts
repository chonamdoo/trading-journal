import { describe, expect, it } from 'vitest';

import { createImportedTrade, mapTradeSourceForPersistence } from './domain/entities/imported-trade';
import { mapImportedTradeSourceToTradeInsertSource } from './data/mappers/imported-trade.mapper';

describe('Exchange Import feature module', () => {
  it('uses exchange as the Imported Trade domain source', () => {
    const importedTrade = createImportedTrade({
      exchange: 'bybit',
      externalId: 'order-1',
      tradeSource: 'exchange',
      importStatus: 'draft',
    });

    expect(importedTrade.tradeSource).toBe('exchange');
    expect(importedTrade.importStatus).toBe('draft');
  });

  it('keeps legacy persistence source isolated from domain language', () => {
    expect(mapTradeSourceForPersistence('exchange')).toBe('api');
    expect(mapImportedTradeSourceToTradeInsertSource('exchange')).toBe('api');
    expect(mapImportedTradeSourceToTradeInsertSource('manual')).toBe('manual');
    expect(mapImportedTradeSourceToTradeInsertSource('csv')).toBe('csv');
  });
});
