export interface PreTradeChecklistState {
  hasStopLoss: boolean
  withinRiskLimit: boolean
  notChasing: boolean
}

export const PRE_TRADE_CHECKLIST_ITEMS: Array<{
  key: keyof PreTradeChecklistState
  label: string
}> = [
  { key: 'hasStopLoss', label: '손절가(SL)를 설정했는가?' },
  { key: 'withinRiskLimit', label: '총 자산의 2% 이내의 리스크인가?' },
  { key: 'notChasing', label: '추격 매수가 아닌가?' },
]

export function createInitialPreTradeChecklistState(): PreTradeChecklistState {
  return {
    hasStopLoss: false,
    withinRiskLimit: false,
    notChasing: false,
  }
}

export function getIncompletePreTradeChecklistItems(
  state: PreTradeChecklistState,
): string[] {
  return PRE_TRADE_CHECKLIST_ITEMS
    .filter((item) => !state[item.key])
    .map((item) => item.label)
}

export function getPreTradeChecklistWarning(
  state: PreTradeChecklistState,
): string | null {
  const incomplete = getIncompletePreTradeChecklistItems(state)
  if (incomplete.length === 0) return null
  return `프리트레이드 체크리스트 미완료: ${incomplete.join(', ')}`
}
