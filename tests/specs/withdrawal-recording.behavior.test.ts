import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { curCapital, getEquityCurve, tradingBase } from '@/lib/calc';
import type { Deposit } from '@/types';

describe('withdrawal recording', () => {
  it('subtracts withdrawals from current capital and trading base', () => {
    const capitalMovements: Deposit[] = [
      { id: 'deposit-1', date: '2026-05-01', amount: 500 },
      { id: 'withdrawal-1', date: '2026-05-02', amount: -100 },
    ];

    expect(curCapital(1000, capitalMovements, [])).toBe(1400);
    expect(tradingBase(1000, capitalMovements)).toBe(1400);
  });

  it('applies withdrawals to the equity curve', () => {
    const capitalMovements: Deposit[] = [
      { id: 'deposit-1', date: '2026-05-01', amount: 500 },
      { id: 'withdrawal-1', date: '2026-05-02', amount: -100 },
    ];

    const equityCurve = getEquityCurve([], capitalMovements, 1000);

    expect(equityCurve.at(-1)).toEqual({
      date: '2026-05-02',
      capital: 1400,
      funded: 1400,
      pnlOnly: 0,
    });
  });

  it('saves withdrawal form input as a negative capital movement', () => {
    const settingsPage = readFileSync('src/app/(main)/settings/page.tsx', 'utf8');
    const depositActionSource = settingsPage.slice(
      settingsPage.indexOf('const handleAddDeposit = async'),
      settingsPage.indexOf('// 칩의', settingsPage.indexOf('const handleAddDeposit = async')),
    );

    expect(settingsPage).toContain("useState<'deposit' | 'withdrawal'>('deposit')");
    expect(depositActionSource).toContain("capitalEventType === 'withdrawal' ? -amount : amount");
    expect(settingsPage).toContain('입출금 기록');
    expect(settingsPage).toContain('출금');
  });

  it('allows signed non-zero capital movement amounts in the database', () => {
    const migrations = readFileSync('supabase/migrations/20260507000300_allow_signed_deposit_amounts.sql', 'utf8');

    expect(migrations).toContain('DROP CONSTRAINT IF EXISTS deposits_amount_check');
    expect(migrations).toContain('CHECK (amount <> 0)');
  });

  it('does not show success after a failed withdrawal save', () => {
    const settingsPage = readFileSync('src/app/(main)/settings/page.tsx', 'utf8');
    const tradeStore = readFileSync('src/hooks/useTrades.ts', 'utf8');
    const depositActionSource = settingsPage.slice(
      settingsPage.indexOf('const handleAddDeposit = async'),
      settingsPage.indexOf('// 칩의', settingsPage.indexOf('const handleAddDeposit = async')),
    );

    expect(tradeStore).toContain('addDeposit: (date: string, amount: number, memo?: string) => Promise<ApiResult<Deposit>>');
    expect(depositActionSource).toContain('const result = await addDeposit');
    expect(depositActionSource).toContain('if (!result.success) return');
  });

  it('does not render net capital movement as always positive', () => {
    const kpiGrid = readFileSync('src/components/dashboard/KpiGrid.tsx', 'utf8');

    expect(kpiGrid).toContain("const depositSign = tdep >= 0 ? '+' : '-'");
    expect(kpiGrid).toContain('Math.abs(tdep)');
    expect(kpiGrid).toContain("colorClass={tdep >= 0 ? 'text-info' : 'text-loss'}");
    expect(kpiGrid).not.toContain('value={`+${formatNumber(tdep)} USDT`}');
  });
});
