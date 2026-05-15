import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PRE_TRADE_CHECKLIST_ITEMS,
  createInitialPreTradeChecklistState,
  getIncompletePreTradeChecklistItems,
  getPreTradeChecklistWarning,
  resolvePreTradeChecklistItems,
} from '@/components/trades/preTradeChecklist';

describe('pre-trade checklist behavior', () => {
  it('starts every checklist item unchecked', () => {
    expect(createInitialPreTradeChecklistState()).toEqual({
      hasStopLoss: false,
      withinRiskLimit: false,
      notChasing: false,
    });
  });

  it('starts custom checklist items unchecked', () => {
    expect(createInitialPreTradeChecklistState([
      { id: 'plan-entry', label: '진입 시나리오를 확인했는가?' },
      { id: 'risk-reward', label: '손익비가 충분한가?' },
    ])).toEqual({
      'plan-entry': false,
      'risk-reward': false,
    });
  });

  it('returns no warning when every pre-trade check is complete', () => {
    const warning = getPreTradeChecklistWarning({
      hasStopLoss: true,
      withinRiskLimit: true,
      notChasing: true,
    });

    expect(warning).toBeNull();
  });

  it('warns about incomplete checks without blocking save', () => {
    const incomplete = getIncompletePreTradeChecklistItems({
      hasStopLoss: false,
      withinRiskLimit: true,
      notChasing: false,
    });

    expect(incomplete).toEqual([
      '손절가(SL)를 설정했는가?',
      '추격 매수가 아닌가?',
    ]);
    expect(getPreTradeChecklistWarning({
      hasStopLoss: false,
      withinRiskLimit: true,
      notChasing: false,
    })).toBe('프리트레이드 체크리스트 미완료: 손절가(SL)를 설정했는가?, 추격 매수가 아닌가?');
  });

  it('warns about incomplete custom checklist items', () => {
    const items = [
      { id: 'plan-entry', label: '진입 시나리오를 확인했는가?' },
      { id: 'risk-reward', label: '손익비가 충분한가?' },
    ];

    expect(getIncompletePreTradeChecklistItems({ 'plan-entry': true }, items)).toEqual([
      '손익비가 충분한가?',
    ]);
  });

  it('falls back to defaults only when profile settings are missing', () => {
    expect(resolvePreTradeChecklistItems(null)).toEqual(DEFAULT_PRE_TRADE_CHECKLIST_ITEMS);
    expect(resolvePreTradeChecklistItems([])).toEqual([]);
  });
});
