import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('trade form input state behavior', () => {
  it('keeps the last saved leverage and input value by asset only when the setting is enabled', () => {
    const tradeForm = read('src/components/trades/TradeForm.tsx');
    const preferences = read('src/lib/tradeFormPreferences.ts');

    expect(preferences).toContain('TRADE_FORM_SETUP_BY_ASSET_KEY');
    expect(preferences).toContain('TRADE_FORM_INPUT_MODE_KEY');
    expect(preferences).toContain('TRADE_FORM_REMEMBER_INPUT_MODE_BY_ASSET_ENABLED_KEY');
    expect(preferences).toContain("window.localStorage.getItem(TRADE_FORM_REMEMBER_INPUT_MODE_BY_ASSET_ENABLED_KEY) === 'true'");
    expect(tradeForm).toContain('applyTradeFormSetup(getTradeFormSetupForAsset(value))');
    expect(tradeForm).toContain('const nextInputMode = setup?.inputMode ?? getTradeFormInputMode()');
    expect(tradeForm).toContain('setTradeFormInputMode(mode)');
    expect(tradeForm).toContain('setLeverageStr(String(setup?.leverage ?? 10))');
    expect(tradeForm).toContain('saveTradeFormSetupForAsset(finalAsset, {');
    expect(tradeForm).toContain("margin: inputMode === 'margin' ? margin : undefined");
    expect(tradeForm).toContain("quantity: inputMode === 'quantity' ? quantity : undefined");
  });

  it('resets fee fields after a successful create save', () => {
    const tradeForm = read('src/components/trades/TradeForm.tsx');
    const resetStart = tradeForm.indexOf('const resetForm = useCallback(() => {');
    const resetEnd = tradeForm.indexOf('const togglePreTradeChecklist', resetStart);
    const resetForm = tradeForm.slice(resetStart, resetEnd);

    expect(resetForm).toContain("setTradingFee('')");
    expect(resetForm).toContain("setFundingFee('')");
    expect(resetForm).toContain("setTradingFeeDir('paid')");
    expect(resetForm).toContain("setFundingFeeDir('paid')");
  });

  it('exposes the asset input mode memory setting in settings', () => {
    const settingsPage = read('src/app/(main)/settings/page.tsx');

    expect(settingsPage).toContain('rememberTradeInputModeByAsset');
    expect(settingsPage).toContain('setTradeFormInputModeMemoryEnabled(nextEnabled)');
    expect(settingsPage).toContain('코인별 입력값 기억');
    expect(settingsPage).toContain('이전 레버리지와 증거금/수량 적용');
  });
});
