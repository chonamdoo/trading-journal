import { describe, expect, it } from 'vitest';

import {
  createInitialPreTradeChecklistState,
  getIncompletePreTradeChecklistItems,
  getPreTradeChecklistWarning,
} from '@/components/trades/preTradeChecklist';

describe('pre-trade checklist behavior', () => {
  it('starts every checklist item unchecked', () => {
    expect(createInitialPreTradeChecklistState()).toEqual({
      hasStopLoss: false,
      withinRiskLimit: false,
      notChasing: false,
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
});
