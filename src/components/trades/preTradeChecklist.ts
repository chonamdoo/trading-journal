import type { PreTradeChecklistItem } from '@/types'

export type PreTradeChecklistState = Record<string, boolean>

export const DEFAULT_PRE_TRADE_CHECKLIST_ITEMS: PreTradeChecklistItem[] = [
  { id: 'hasStopLoss', label: '손절가(SL)를 설정했는가?' },
  { id: 'withinRiskLimit', label: '총 자산의 2% 이내의 리스크인가?' },
  { id: 'notChasing', label: '추격 매수가 아닌가?' },
]

export const PRE_TRADE_CHECKLIST_ITEMS = DEFAULT_PRE_TRADE_CHECKLIST_ITEMS

export function resolvePreTradeChecklistItems(
  items?: PreTradeChecklistItem[] | null,
): PreTradeChecklistItem[] {
  if (!items) return DEFAULT_PRE_TRADE_CHECKLIST_ITEMS

  return items.filter((item) => item.id.trim() && item.label.trim())
}

export function createInitialPreTradeChecklistState(
  items: PreTradeChecklistItem[] = DEFAULT_PRE_TRADE_CHECKLIST_ITEMS,
): PreTradeChecklistState {
  return Object.fromEntries(items.map((item) => [item.id, false]))
}

export function getIncompletePreTradeChecklistItems(
  state: PreTradeChecklistState,
  items: PreTradeChecklistItem[] = DEFAULT_PRE_TRADE_CHECKLIST_ITEMS,
): string[] {
  return items
    .filter((item) => !state[item.id])
    .map((item) => item.label)
}

export function getPreTradeChecklistWarning(
  state: PreTradeChecklistState,
  items: PreTradeChecklistItem[] = DEFAULT_PRE_TRADE_CHECKLIST_ITEMS,
): string | null {
  const incomplete = getIncompletePreTradeChecklistItems(state, items)
  if (incomplete.length === 0) return null
  return `프리트레이드 체크리스트 미완료: ${incomplete.join(', ')}`
}
