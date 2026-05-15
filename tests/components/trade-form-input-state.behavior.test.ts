import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getTradeFormInputMode,
  getTradeFormSetupForAsset,
  isTradeFormInputModeMemoryEnabled,
  saveTradeFormSetupForAsset,
  setTradeFormInputMode,
  setTradeFormInputModeMemoryEnabled,
} from '@/lib/tradeFormPreferences';

function createLocalStorage(options: { failWrites?: boolean } = {}): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      if (options.failWrites) {
        throw new Error('localStorage write failed');
      }
      values.set(key, value);
    },
  };
}

function stubWindow(localStorage: Storage): void {
  vi.stubGlobal('window', { localStorage });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trade form input state behavior', () => {
  it('defaults to margin input mode until the user chooses another mode', () => {
    stubWindow(createLocalStorage());

    expect(getTradeFormInputMode()).toBe('margin');

    setTradeFormInputMode('quantity');

    expect(getTradeFormInputMode()).toBe('quantity');
  });

  it('restores same-asset leverage and input value only when memory is enabled', () => {
    stubWindow(createLocalStorage());

    saveTradeFormSetupForAsset('eth', {
      inputMode: 'quantity',
      leverage: 25,
      quantity: '0.42',
    });

    expect(isTradeFormInputModeMemoryEnabled()).toBe(false);
    expect(getTradeFormSetupForAsset('ETH')).toBeNull();

    setTradeFormInputModeMemoryEnabled(true);
    saveTradeFormSetupForAsset('eth', {
      inputMode: 'quantity',
      leverage: 25,
      quantity: '0.42',
    });

    expect(getTradeFormSetupForAsset('ETH')).toEqual({
      inputMode: 'quantity',
      leverage: 25,
      quantity: '0.42',
    });
    expect(getTradeFormSetupForAsset('BTC')).toBeNull();
  });

  it('ignores localStorage write failures without throwing', () => {
    stubWindow(createLocalStorage({ failWrites: true }));

    expect(() => setTradeFormInputMode('quantity')).not.toThrow();
    expect(() => setTradeFormInputModeMemoryEnabled(true)).not.toThrow();
    expect(() => saveTradeFormSetupForAsset('BTC', {
      inputMode: 'margin',
      leverage: 10,
      margin: '500',
    })).not.toThrow();
    expect(getTradeFormInputMode()).toBe('margin');
    expect(isTradeFormInputModeMemoryEnabled()).toBe(false);
  });
});
