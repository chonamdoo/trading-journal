export type TradeFormInputMode = 'margin' | 'quantity'

export interface TradeFormAssetSetup {
  inputMode: TradeFormInputMode
  leverage: number
  margin?: string
  quantity?: string
}

const TRADE_FORM_SETUP_BY_ASSET_KEY = 'trade-form-setup-by-asset'
const TRADE_FORM_INPUT_MODE_KEY = 'trade-form-input-mode'
const TRADE_FORM_REMEMBER_INPUT_MODE_BY_ASSET_ENABLED_KEY = 'trade-form-remember-input-mode-by-asset-enabled'

function getLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function setLocalStorageItem(key: string, value: string): void {
  try {
    getLocalStorage()?.setItem(key, value)
  } catch {
    return
  }
}

function normalizeAssetSymbol(asset: string): string {
  return asset.trim().toUpperCase()
}

function isTradeFormInputMode(value: unknown): value is TradeFormInputMode {
  return value === 'margin' || value === 'quantity'
}

function isTradeFormAssetSetup(value: unknown): value is TradeFormAssetSetup {
  if (value == null || typeof value !== 'object') return false
  const setup = value as Partial<TradeFormAssetSetup>
  return isTradeFormInputMode(setup.inputMode) && typeof setup.leverage === 'number'
}

function readSetupByAsset(): Record<string, TradeFormAssetSetup> {
  const storage = getLocalStorage()
  if (!storage) return {}

  try {
    const raw = storage.getItem(TRADE_FORM_SETUP_BY_ASSET_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, TradeFormAssetSetup] =>
        isTradeFormAssetSetup(entry[1])
      )
    )
  } catch {
    return {}
  }
}

export function isTradeFormInputModeMemoryEnabled(): boolean {
  const storage = getLocalStorage()
  if (!storage) return false
  return storage.getItem(TRADE_FORM_REMEMBER_INPUT_MODE_BY_ASSET_ENABLED_KEY) === 'true'
}

export function setTradeFormInputModeMemoryEnabled(enabled: boolean): void {
  setLocalStorageItem(TRADE_FORM_REMEMBER_INPUT_MODE_BY_ASSET_ENABLED_KEY, String(enabled))
}

export function getTradeFormInputMode(): TradeFormInputMode {
  const storage = getLocalStorage()
  if (!storage) return 'margin'

  const savedInputMode = storage.getItem(TRADE_FORM_INPUT_MODE_KEY)
  return isTradeFormInputMode(savedInputMode) ? savedInputMode : 'margin'
}

export function setTradeFormInputMode(mode: TradeFormInputMode): void {
  setLocalStorageItem(TRADE_FORM_INPUT_MODE_KEY, mode)
}

export function getTradeFormSetupForAsset(asset: string): TradeFormAssetSetup | null {
  if (!isTradeFormInputModeMemoryEnabled()) return null

  const normalizedAsset = normalizeAssetSymbol(asset)
  if (!normalizedAsset) return null

  return readSetupByAsset()[normalizedAsset] ?? null
}

export function saveTradeFormSetupForAsset(asset: string, setup: TradeFormAssetSetup): void {
  if (!isTradeFormInputModeMemoryEnabled()) return

  const normalizedAsset = normalizeAssetSymbol(asset)
  if (!normalizedAsset) return

  const nextSetupByAsset = {
    ...readSetupByAsset(),
    [normalizedAsset]: setup,
  }

  setLocalStorageItem(TRADE_FORM_SETUP_BY_ASSET_KEY, JSON.stringify(nextSetupByAsset))
}
