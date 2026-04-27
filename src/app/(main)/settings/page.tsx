'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { AssetCombobox } from '@/components/ui/AssetCombobox'
import { showToast } from '@/components/ui/Toast'
import { useTrades } from '@/hooks/useTrades'
import { useAssets } from '@/hooks/useAssets'
import { useTheme } from '@/hooks/useTheme'
import { createClient } from '@/lib/supabase/client'
import {
  fetchBinanceConnection,
  fetchBitgetConnection,
  fetchBybitConnection,
  fetchDeleteBinanceConnection,
  fetchDeleteBitgetConnection,
  fetchDeleteBybitConnection,
  fetchDeleteFlipsterConnection,
  fetchDeleteOkxConnection,
  fetchFlipsterConnection,
  fetchOkxConnection,
  fetchSaveBinanceConnection,
  fetchSaveBitgetConnection,
  fetchSaveBybitConnection,
  fetchSaveFlipsterConnection,
  fetchSaveOkxConnection,
  fetchSyncBinanceTrades,
  fetchSyncBitgetTrades,
  fetchSyncBybitTrades,
  fetchSyncOkxTrades,
  fetchImportJson,
  fetchResetUserData,
  type ExchangeConnectionPublic,
  type ImportPayload,
} from '@/lib/api/client-api'
import { curCapital, totalPnL, totalReturnPct, totalDeposits } from '@/lib/calc'
import { formatNumber, formatPnl, toKrw, today, genId } from '@/lib/format'
import { downloadCsv, tradesToCsv } from '@/lib/csv-export'
import { TARGET_COLORS } from '@/lib/constants'

type ExchangeFormValue = 'bybit' | 'binance' | 'okx' | 'bitget' | 'flipster'

const EXCHANGE_FORM_OPTIONS: Record<ExchangeFormValue, {
  label: string
  defaultName: string
  apiPlaceholder: string
  secretPlaceholder: string
  passphrasePlaceholder?: string
}> = {
  bybit: {
    label: 'Bybit Derivatives',
    defaultName: 'Bybit Derivatives',
    apiPlaceholder: 'Bybit API Key',
    secretPlaceholder: 'Bybit Secret Key',
  },
  binance: {
    label: 'Binance USD-M Futures',
    defaultName: 'Binance USD-M Futures',
    apiPlaceholder: 'Binance API Key',
    secretPlaceholder: 'Binance Secret Key',
  },
  okx: {
    label: 'OKX SWAP',
    defaultName: 'OKX SWAP',
    apiPlaceholder: 'OKX API Key',
    secretPlaceholder: 'OKX Secret Key',
    passphrasePlaceholder: 'OKX Passphrase',
  },
  bitget: {
    label: 'Bitget USDT-Futures',
    defaultName: 'Bitget USDT-Futures',
    apiPlaceholder: 'Bitget API Key',
    secretPlaceholder: 'Bitget Secret Key',
    passphrasePlaceholder: 'Bitget Passphrase',
  },
  flipster: {
    label: 'Flipster',
    defaultName: 'Flipster',
    apiPlaceholder: 'Flipster API Key',
    secretPlaceholder: 'Flipster Secret Key',
  },
}

/**
 * 설정 페이지
 * - 테마 전환
 * - 초기 자산 변경
 * - 코인 목록 관리
 * - 목표 자산 관리
 * - 추가 입금 관리
 * - 데이터 관리 (JSON 가져오기 등)
 */
export default function SettingsPage() {
  const {
    trades, deposits, targets, profile,
    addDeposit, deleteDeposit,
    addTarget, deleteTarget,
    setInitialCapital,
    reloadData,
  } = useTrades()
  const { theme, toggleTheme } = useTheme()
  const { favorites, allAssets, toggleFavorite } = useAssets(profile?.id)
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)
  const tdep = totalDeposits(deposits)

  // 초기 자산 수정 상태
  const [editCapital, setEditCapital] = useState(false)
  const [newCapital, setNewCapital] = useState(initialCapital.toString())

  // 입금 추가 상태
  const [depositDate, setDepositDate] = useState(today())
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMemo, setDepositMemo] = useState('')

  // 목표 추가 상태
  const [targetLabel, setTargetLabel] = useState('')
  const [targetAmount, setTargetAmount] = useState('')

  // 로그아웃 상태
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  // 초기화 모달
  const [resetModal, setResetModal] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [resetting, setResetting] = useState(false)
  const RESET_CONFIRM_PHRASE = '초기화'

  // JSON import 상태
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importPreview, setImportPreview] = useState<ImportPayload | null>(null)
  const [importing, setImporting] = useState(false)
  const MAX_IMPORT_BYTES = 4 * 1024 * 1024

  // 거래소 연결 상태
  const [bybitConnection, setBybitConnection] = useState<ExchangeConnectionPublic | null>(null)
  const [binanceConnection, setBinanceConnection] = useState<ExchangeConnectionPublic | null>(null)
  const [okxConnection, setOkxConnection] = useState<ExchangeConnectionPublic | null>(null)
  const [bitgetConnection, setBitgetConnection] = useState<ExchangeConnectionPublic | null>(null)
  const [flipsterConnection, setFlipsterConnection] = useState<ExchangeConnectionPublic | null>(null)
  const [bybitLoading, setBybitLoading] = useState(true)
  const [binanceLoading, setBinanceLoading] = useState(true)
  const [okxLoading, setOkxLoading] = useState(true)
  const [bitgetLoading, setBitgetLoading] = useState(true)
  const [flipsterLoading, setFlipsterLoading] = useState(true)
  const [bybitSaving, setBybitSaving] = useState(false)
  const [binanceSaving, setBinanceSaving] = useState(false)
  const [flipsterSaving, setFlipsterSaving] = useState(false)
  const [bybitDeleting, setBybitDeleting] = useState(false)
  const [binanceDeleting, setBinanceDeleting] = useState(false)
  const [okxDeleting, setOkxDeleting] = useState(false)
  const [bitgetDeleting, setBitgetDeleting] = useState(false)
  const [flipsterDeleting, setFlipsterDeleting] = useState(false)
  const [bybitSyncing, setBybitSyncing] = useState(false)
  const [binanceSyncing, setBinanceSyncing] = useState(false)
  const [okxSyncing, setOkxSyncing] = useState(false)
  const [bitgetSyncing, setBitgetSyncing] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeFormValue>('bybit')
  const [exchangeApiKey, setExchangeApiKey] = useState('')
  const [exchangeApiSecret, setExchangeApiSecret] = useState('')
  const [exchangePassphrase, setExchangePassphrase] = useState('')
  const [exchangeLabel, setExchangeLabel] = useState(EXCHANGE_FORM_OPTIONS.bybit.defaultName)
  const [exchangeSaving, setExchangeSaving] = useState(false)
  const [bybitLabel, setBybitLabel] = useState('Bybit Derivatives')
  const [bybitApiKey, setBybitApiKey] = useState('')
  const [bybitApiSecret, setBybitApiSecret] = useState('')
  const [bybitSyncFrom, setBybitSyncFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return date.toISOString().slice(0, 10)
  })
  const [bybitSyncTo, setBybitSyncTo] = useState(today())
  const [binanceLabel, setBinanceLabel] = useState('Binance USD-M Futures')
  const [binanceApiKey, setBinanceApiKey] = useState('')
  const [binanceApiSecret, setBinanceApiSecret] = useState('')
  const [binanceSyncFrom, setBinanceSyncFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return date.toISOString().slice(0, 10)
  })
  const [binanceSyncTo, setBinanceSyncTo] = useState(today())
  const [okxSyncFrom, setOkxSyncFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 29)
    return date.toISOString().slice(0, 10)
  })
  const [okxSyncTo, setOkxSyncTo] = useState(today())
  const [bitgetSyncFrom, setBitgetSyncFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 29)
    return date.toISOString().slice(0, 10)
  })
  const [bitgetSyncTo, setBitgetSyncTo] = useState(today())
  const [flipsterLabel, setFlipsterLabel] = useState('Flipster')
  const [flipsterApiKey, setFlipsterApiKey] = useState('')
  const [flipsterApiSecret, setFlipsterApiSecret] = useState('')

  const selectedExchangeConfig = EXCHANGE_FORM_OPTIONS[selectedExchange]
  const selectedExchangeConnection =
    selectedExchange === 'bybit'
      ? bybitConnection
      : selectedExchange === 'binance'
        ? binanceConnection
        : selectedExchange === 'okx'
          ? okxConnection
          : selectedExchange === 'bitget'
            ? bitgetConnection
            : flipsterConnection

  useEffect(() => {
    let mounted = true

    async function loadExchangeConnections() {
      const [bybitResult, binanceResult, okxResult, bitgetResult, flipsterResult] = await Promise.all([
        fetchBybitConnection(),
        fetchBinanceConnection(),
        fetchOkxConnection(),
        fetchBitgetConnection(),
        fetchFlipsterConnection(),
      ])
      if (!mounted) return

      if (bybitResult.success) {
        setBybitConnection(bybitResult.data)
        if (bybitResult.data?.label) setBybitLabel(bybitResult.data.label)
        if (bybitResult.data?.label && selectedExchange === 'bybit') setExchangeLabel(bybitResult.data.label)
      } else {
        showToast('error', bybitResult.error)
      }

      if (binanceResult.success) {
        setBinanceConnection(binanceResult.data)
        if (binanceResult.data?.label) setBinanceLabel(binanceResult.data.label)
        if (binanceResult.data?.label && selectedExchange === 'binance') setExchangeLabel(binanceResult.data.label)
      } else {
        showToast('error', binanceResult.error)
      }

      if (okxResult.success) {
        setOkxConnection(okxResult.data)
        if (okxResult.data?.label && selectedExchange === 'okx') setExchangeLabel(okxResult.data.label)
      } else {
        showToast('error', okxResult.error)
      }

      if (bitgetResult.success) {
        setBitgetConnection(bitgetResult.data)
        if (bitgetResult.data?.label && selectedExchange === 'bitget') setExchangeLabel(bitgetResult.data.label)
      } else {
        showToast('error', bitgetResult.error)
      }

      if (flipsterResult.success) {
        setFlipsterConnection(flipsterResult.data)
        if (flipsterResult.data?.label) setFlipsterLabel(flipsterResult.data.label)
        if (flipsterResult.data?.label && selectedExchange === 'flipster') setExchangeLabel(flipsterResult.data.label)
      } else {
        showToast('error', flipsterResult.error)
      }

      setBybitLoading(false)
      setBinanceLoading(false)
      setOkxLoading(false)
      setBitgetLoading(false)
      setFlipsterLoading(false)
    }

    loadExchangeConnections()
    return () => {
      mounted = false
    }
  }, [])

  const handleSelectExchange = (value: ExchangeFormValue) => {
    setSelectedExchange(value)
    const connection =
      value === 'bybit'
        ? bybitConnection
        : value === 'binance'
          ? binanceConnection
          : value === 'okx'
            ? okxConnection
            : value === 'bitget'
              ? bitgetConnection
              : flipsterConnection
    setExchangeLabel(connection?.label ?? EXCHANGE_FORM_OPTIONS[value].defaultName)
    setExchangeApiKey('')
    setExchangeApiSecret('')
    setExchangePassphrase('')
  }

  // ── 핸들러 ──

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // 1. 클라이언트 측 세션 종료
      const supabase = createClient()
      await supabase.auth.signOut()

      // 2. 서버 측 세션 쿠키 제거
      await fetch('/api/auth/logout', { method: 'POST' })

      // 3. full reload로 Zustand 스토어 초기화 + 로그인 페이지 이동
      window.location.href = '/login'
    } catch {
      showToast('error', '로그아웃에 실패했습니다. 다시 시도해주세요.')
      setLoggingOut(false)
    }
  }

  const handleImportFile = async (file: File) => {
    if (file.size > MAX_IMPORT_BYTES) {
      showToast('error', `파일이 너무 큽니다 (최대 ${MAX_IMPORT_BYTES / 1024 / 1024}MB).`)
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      showToast('error', '파일을 읽을 수 없습니다.')
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      showToast('error', 'JSON 파일을 읽을 수 없습니다.')
      return
    }
    // 클라이언트 1차 검증 — 필수 필드만. 상세 검증은 서버 Zod에서 다시.
    const p = parsed as Partial<ImportPayload>
    if (
      typeof p.initialCapital !== 'number'
      || !Array.isArray(p.trades)
      || !Array.isArray(p.deposits)
      || !Array.isArray(p.targets)
      || !Array.isArray(p.customAssets)
    ) {
      showToast('error', '레거시 v4 형식이 아닙니다.')
      return
    }
    setImportPreview(p as ImportPayload)
  }

  const handleConfirmReset = async () => {
    if (resetConfirmText.trim() !== RESET_CONFIRM_PHRASE || resetting) return
    setResetting(true)
    const res = await fetchResetUserData()
    setResetting(false)
    if (!res.success) {
      showToast('error', res.error)
      return
    }
    const { trades: t, deposits: d, targets: g, storage_files_removed: s, storage_files_failed: sf } = res.data
    const storageMsg = sf > 0 ? ` (스크린샷 ${s}건 삭제, ${sf}건 실패)` : ` (스크린샷 ${s}건 삭제)`
    showToast('success', `초기화 완료 — 거래 ${t} · 입금 ${d} · 목표 ${g}${storageMsg}`)
    setResetModal(false)
    setResetConfirmText('')
    await reloadData()
    router.replace('/onboarding')
  }

  const handleConfirmImport = async () => {
    if (!importPreview || importing) return
    setImporting(true)
    const res = await fetchImportJson(importPreview)
    setImporting(false)
    if (!res.success) {
      showToast('error', res.error)
      return
    }
    const { trades: t, deposits: d, targets: g, custom_assets: c } = res.data
    showToast('success', `Import 완료 — 거래 ${t}건, 입금 ${d}건, 목표 ${g}건, 코인 ${c}건`)
    setImportPreview(null)
    await reloadData()
  }

  const handleSaveCapital = async () => {
    const val = parseFloat(newCapital)
    if (isNaN(val) || val <= 0) {
      showToast('error', '유효한 금액을 입력해주세요.')
      return
    }
    await setInitialCapital(val)
    setEditCapital(false)
    showToast('success', '초기 자산이 변경되었습니다.')
  }

  const handleAddDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('error', '유효한 금액을 입력해주세요.')
      return
    }
    await addDeposit(depositDate, amount, depositMemo || undefined)
    setDepositAmount('')
    setDepositMemo('')
    showToast('success', '입금이 추가되었습니다.')
  }

  // 칩의 × 버튼 → 해제. AssetCombobox(picker 모드)는 자체적으로 toggleFavorite 호출
  const handleRemoveFavorite = async (symbol: string) => {
    if (!favorites.includes(symbol)) return
    const res = await toggleFavorite(symbol)
    if (res.success && !res.favorited) {
      showToast('success', `${symbol} 즐겨찾기 해제`)
    }
  }

  const handleAddTarget = async () => {
    const amount = parseFloat(targetAmount)
    if (!targetLabel.trim()) {
      showToast('error', '목표 이름을 입력해주세요.')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('error', '유효한 금액을 입력해주세요.')
      return
    }
    await addTarget(targetLabel.trim(), amount)
    setTargetLabel('')
    setTargetAmount('')
    showToast('success', '목표가 추가되었습니다.')
  }

  const handleSaveSelectedExchangeConnection = async () => {
    if (!exchangeApiKey.trim() || !exchangeApiSecret.trim()) {
      showToast('error', 'API Key와 Secret Key를 입력해주세요.')
      return
    }
    if (selectedExchangeConfig.passphrasePlaceholder && !exchangePassphrase.trim()) {
      showToast('error', 'Passphrase를 입력해주세요.')
      return
    }

    setExchangeSaving(true)
    const params = {
      apiKey: exchangeApiKey.trim(),
      apiSecret: exchangeApiSecret.trim(),
      label: exchangeLabel.trim() || undefined,
    }
    const result =
      selectedExchange === 'bybit'
        ? await fetchSaveBybitConnection(params)
        : selectedExchange === 'binance'
          ? await fetchSaveBinanceConnection(params)
          : selectedExchange === 'okx'
            ? await fetchSaveOkxConnection({ ...params, passphrase: exchangePassphrase.trim() })
            : selectedExchange === 'bitget'
              ? await fetchSaveBitgetConnection({ ...params, passphrase: exchangePassphrase.trim() })
              : await fetchSaveFlipsterConnection(params)
    setExchangeSaving(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    if (selectedExchange === 'bybit') {
      setBybitConnection(result.data)
      if (result.data.label) setBybitLabel(result.data.label)
    } else if (selectedExchange === 'binance') {
      setBinanceConnection(result.data)
      if (result.data.label) setBinanceLabel(result.data.label)
    } else if (selectedExchange === 'okx') {
      setOkxConnection(result.data)
    } else if (selectedExchange === 'bitget') {
      setBitgetConnection(result.data)
    } else {
      setFlipsterConnection(result.data)
      if (result.data.label) setFlipsterLabel(result.data.label)
    }

    setExchangeApiKey('')
    setExchangeApiSecret('')
    setExchangePassphrase('')
    showToast('success', `${selectedExchangeConfig.label} 연결이 저장되었습니다.`)
  }

  const handleSaveBybitConnection = async () => {
    if (!bybitApiKey.trim() || !bybitApiSecret.trim()) {
      showToast('error', 'Bybit API Key와 Secret을 입력해주세요.')
      return
    }

    setBybitSaving(true)
    const result = await fetchSaveBybitConnection({
      apiKey: bybitApiKey.trim(),
      apiSecret: bybitApiSecret.trim(),
      label: bybitLabel.trim() || undefined,
    })
    setBybitSaving(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBybitConnection(result.data)
    setBybitApiKey('')
    setBybitApiSecret('')
    showToast('success', 'Bybit 연결이 저장되었습니다.')
  }

  const handleSaveBinanceConnection = async () => {
    if (!binanceApiKey.trim() || !binanceApiSecret.trim()) {
      showToast('error', 'Binance API Key와 Secret을 입력해주세요.')
      return
    }

    setBinanceSaving(true)
    const result = await fetchSaveBinanceConnection({
      apiKey: binanceApiKey.trim(),
      apiSecret: binanceApiSecret.trim(),
      label: binanceLabel.trim() || undefined,
    })
    setBinanceSaving(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBinanceConnection(result.data)
    setBinanceApiKey('')
    setBinanceApiSecret('')
    showToast('success', 'Binance 연결이 저장되었습니다.')
  }

  const handleSaveFlipsterConnection = async () => {
    if (!flipsterApiKey.trim() || !flipsterApiSecret.trim()) {
      showToast('error', 'Flipster API Key와 Secret을 입력해주세요.')
      return
    }

    setFlipsterSaving(true)
    const result = await fetchSaveFlipsterConnection({
      apiKey: flipsterApiKey.trim(),
      apiSecret: flipsterApiSecret.trim(),
      label: flipsterLabel.trim() || undefined,
    })
    setFlipsterSaving(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setFlipsterConnection(result.data)
    setFlipsterApiKey('')
    setFlipsterApiSecret('')
    showToast('success', 'Flipster 연결이 저장되었습니다.')
  }

  const handleDeleteBybitConnection = async () => {
    setBybitDeleting(true)
    const result = await fetchDeleteBybitConnection()
    setBybitDeleting(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBybitConnection(null)
    setBybitApiKey('')
    setBybitApiSecret('')
    showToast('success', 'Bybit 연결이 삭제되었습니다.')
  }

  const handleDeleteBinanceConnection = async () => {
    setBinanceDeleting(true)
    const result = await fetchDeleteBinanceConnection()
    setBinanceDeleting(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBinanceConnection(null)
    setBinanceApiKey('')
    setBinanceApiSecret('')
    showToast('success', 'Binance 연결이 삭제되었습니다.')
  }

  const handleDeleteOkxConnection = async () => {
    setOkxDeleting(true)
    const result = await fetchDeleteOkxConnection()
    setOkxDeleting(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setOkxConnection(null)
    showToast('success', 'OKX 연결이 삭제되었습니다.')
  }

  const handleDeleteBitgetConnection = async () => {
    setBitgetDeleting(true)
    const result = await fetchDeleteBitgetConnection()
    setBitgetDeleting(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBitgetConnection(null)
    showToast('success', 'Bitget 연결이 삭제되었습니다.')
  }

  const handleDeleteFlipsterConnection = async () => {
    setFlipsterDeleting(true)
    const result = await fetchDeleteFlipsterConnection()
    setFlipsterDeleting(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setFlipsterConnection(null)
    setFlipsterApiKey('')
    setFlipsterApiSecret('')
    showToast('success', 'Flipster 연결이 삭제되었습니다.')
  }

  const handleSyncBybitTrades = async () => {
    setBybitSyncing(true)
    const result = await fetchSyncBybitTrades({ from: bybitSyncFrom, to: bybitSyncTo })
    setBybitSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBybitConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast(
      'success',
      `Bybit 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 겹침/중복으로 건너뜀`
    )
  }

  const handleSyncBybitPreset = async (days: 30 | 90) => {
    setBybitSyncing(true)
    const result = await fetchSyncBybitTrades({ days })
    setBybitSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBybitConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast('success', `Bybit ${days}일 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 건너뜀`)
  }

  const handleSyncBinanceTrades = async () => {
    setBinanceSyncing(true)
    const result = await fetchSyncBinanceTrades({ from: binanceSyncFrom, to: binanceSyncTo })
    setBinanceSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBinanceConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast(
      'success',
      `Binance 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 겹침/중복으로 건너뜀`
    )
  }

  const handleSyncBinancePreset = async (days: 30 | 90) => {
    setBinanceSyncing(true)
    const result = await fetchSyncBinanceTrades({ days })
    setBinanceSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBinanceConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast('success', `Binance ${days}일 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 건너뜀`)
  }

  const handleSyncOkxTrades = async (days?: 30 | 90) => {
    setOkxSyncing(true)
    const result = await fetchSyncOkxTrades(days ? { days } : { from: okxSyncFrom, to: okxSyncTo })
    setOkxSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setOkxConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast(
      'success',
      `OKX 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 겹침/중복으로 건너뜀`
    )
  }

  const handleSyncBitgetTrades = async (days?: 30 | 90) => {
    setBitgetSyncing(true)
    const result = await fetchSyncBitgetTrades(days ? { days } : { from: bitgetSyncFrom, to: bitgetSyncTo })
    setBitgetSyncing(false)

    if (!result.success) {
      showToast('error', result.error)
      return
    }

    setBitgetConnection((current) => current
      ? { ...current, last_synced_at: new Date().toISOString() }
      : current)
    await reloadData()
    showToast(
      'success',
      `Bitget 동기화 완료: ${result.data.imported}건 추가, ${result.data.skipped}건 겹침/중복으로 건너뜀`
    )
  }

  return (
    <>
      {/* 프로필/테마 */}
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          프로필
        </h2>

        {/* 테마 전환 */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
          <div>
            <div className="text-sm font-medium">테마</div>
            <div className="text-[12px] text-content-muted">
              {theme === 'dark' ? '다크 모드' : '라이트 모드'}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? '라이트로 전환' : '다크로 전환'}
          </Button>
        </div>

        {/* 초기 자산 */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">초기 자산</div>
            <div className="text-[12px] text-content-muted font-mono">
              ${formatNumber(initialCapital)}
            </div>
          </div>
          {editCapital ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="w-32 px-2 py-1 bg-surface border border-border-input rounded-input text-sm font-mono outline-none focus:border-info"
                value={newCapital}
                onChange={(e) => setNewCapital(e.target.value)}
              />
              <Button size="sm" onClick={handleSaveCapital}>
                저장
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditCapital(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewCapital(initialCapital.toString())
                setEditCapital(true)
              }}
            >
              변경
            </Button>
          )}
        </div>
      </Card>

      {/* 거래소 연결 */}
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          거래소 연결
        </h2>

        <div className="mb-6 rounded-input border border-border bg-surface px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr_1fr_auto] gap-2 items-end">
            <label className="block">
              <span className="block text-[12px] font-medium text-content-muted mb-1.5">
                거래소
              </span>
              <select
                className="w-full px-3 py-[9px] bg-surface border border-border-input rounded-input text-content text-[13px] outline-none cursor-pointer focus:border-accent-primary"
                value={selectedExchange}
                onChange={(e) => handleSelectExchange(e.target.value as ExchangeFormValue)}
              >
                {Object.entries(EXCHANGE_FORM_OPTIONS).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="API Key"
              type="password"
              autoComplete="off"
              placeholder={selectedExchangeConfig.apiPlaceholder}
              value={exchangeApiKey}
              onChange={(e) => setExchangeApiKey(e.target.value)}
            />
            <Input
              label="Secret Key"
              type="password"
              autoComplete="off"
              placeholder={selectedExchangeConfig.secretPlaceholder}
              value={exchangeApiSecret}
              onChange={(e) => setExchangeApiSecret(e.target.value)}
            />
            {selectedExchangeConfig.passphrasePlaceholder ? (
              <Input
                label="Passphrase"
                type="password"
                autoComplete="off"
                placeholder={selectedExchangeConfig.passphrasePlaceholder}
                value={exchangePassphrase}
                onChange={(e) => setExchangePassphrase(e.target.value)}
              />
            ) : (
              <div className="hidden md:block" />
            )}
            <Button
              size="sm"
              onClick={handleSaveSelectedExchangeConnection}
              disabled={
                exchangeSaving
                || !exchangeApiKey.trim()
                || !exchangeApiSecret.trim()
                || Boolean(selectedExchangeConfig.passphrasePlaceholder && !exchangePassphrase.trim())
              }
            >
              {exchangeSaving ? '검증 중...' : selectedExchangeConnection ? '다시 연결' : '연결'}
            </Button>
          </div>
          <div className="mt-3">
            <Input
              label="표시 이름"
              placeholder={selectedExchangeConfig.defaultName}
              value={exchangeLabel}
              onChange={(e) => setExchangeLabel(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-content-muted mt-3">
            선택한 거래소의 Read-only 키만 저장합니다. OKX/Bitget은 공식 API 인증 기준에 맞춰 Passphrase도 필요합니다. 키 원문은 서버에서 검증 후 암호화되어 저장되며 다시 표시되지 않습니다.
          </p>
        </div>

        <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-border">
          <div>
            <div className="text-sm font-medium">Bybit Derivatives</div>
            <div className="text-[12px] text-content-muted">
              {bybitLoading
                ? '연결 상태 확인 중...'
                : bybitConnection
                  ? `연결됨 · ${bybitConnection.permissions_verified ? '권한 검증 완료' : '권한 미검증'}`
                  : '연결되지 않음'}
            </div>
            {bybitConnection?.last_synced_at && (
              <div className="text-[11px] text-content-muted font-mono mt-1">
                마지막 동기화: {new Date(bybitConnection.last_synced_at).toLocaleString()}
              </div>
            )}
          </div>
          {bybitConnection && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteBybitConnection}
              disabled={bybitDeleting || bybitSyncing}
            >
              {bybitDeleting ? '삭제 중...' : '연결 삭제'}
            </Button>
          )}
        </div>

        {bybitConnection && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-[160px_160px_auto_auto_auto_1fr] gap-2 items-end">
            <Input
              label="가져오기 시작일"
              type="date"
              value={bybitSyncFrom}
              onChange={(e) => setBybitSyncFrom(e.target.value)}
            />
            <Input
              label="가져오기 종료일"
              type="date"
              value={bybitSyncTo}
              onChange={(e) => setBybitSyncTo(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncBybitTrades}
              disabled={bybitSyncing}
            >
              {bybitSyncing ? '가져오는 중...' : '선택 기간 가져오기'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSyncBybitPreset(30)} disabled={bybitSyncing}>
              30일
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSyncBybitPreset(90)} disabled={bybitSyncing}>
              90일
            </Button>
            <div className="text-[11px] text-content-muted pb-2">
              30/90일은 내부적으로 7일 단위로 나누어 가져오며, 같은 주문은 다시 저장하지 않고 건너뜁니다.
            </div>
          </div>
        )}

        <p className="text-[11px] text-content-muted mt-3">
          Bybit는 Read-only 및 Futures 읽기 권한이 있는 키만 저장됩니다.
        </p>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm font-medium">Binance USD-M Futures</div>
              <div className="text-[12px] text-content-muted">
                {binanceLoading
                  ? '연결 상태 확인 중...'
                  : binanceConnection
                    ? `연결됨 · ${binanceConnection.permissions_verified ? '권한 검증 완료' : '권한 미검증'}`
                    : '연결되지 않음'}
              </div>
              {binanceConnection?.last_synced_at && (
                <div className="text-[11px] text-content-muted font-mono mt-1">
                  마지막 동기화: {new Date(binanceConnection.last_synced_at).toLocaleString()}
                </div>
              )}
            </div>
            {binanceConnection && (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteBinanceConnection}
                  disabled={binanceDeleting || binanceSyncing}
                >
                  {binanceDeleting ? '삭제 중...' : '연결 삭제'}
                </Button>
              </div>
            )}
          </div>

          {binanceConnection && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-[160px_160px_auto_auto_auto_1fr] gap-2 items-end">
              <Input
                label="가져오기 시작일"
                type="date"
                value={binanceSyncFrom}
                onChange={(e) => setBinanceSyncFrom(e.target.value)}
              />
              <Input
                label="가져오기 종료일"
                type="date"
                value={binanceSyncTo}
                onChange={(e) => setBinanceSyncTo(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSyncBinanceTrades}
                disabled={binanceSyncing}
              >
                {binanceSyncing ? '가져오는 중...' : '선택 기간 가져오기'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncBinancePreset(30)} disabled={binanceSyncing}>
                30일
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncBinancePreset(90)} disabled={binanceSyncing}>
                90일
              </Button>
              <div className="text-[11px] text-content-muted pb-2">
                30/90일은 내부적으로 7일 단위로 나누어 가져오며, 중복 체결은 건너뜁니다.
              </div>
            </div>
          )}

          <p className="text-[11px] text-content-muted mt-3">
            Binance는 Read-only, Futures 읽기 권한, 출금/거래/전송 권한 비활성 키만 허용합니다. 공식 userTrades 응답에는 과거 레버리지가 없어 초안은 x1 기준으로 들어갑니다.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm font-medium">OKX SWAP</div>
              <div className="text-[12px] text-content-muted">
                {okxLoading
                  ? '연결 상태 확인 중...'
                  : okxConnection
                    ? `연결됨 · ${okxConnection.permissions_verified ? '권한 검증 완료' : '권한 미검증'}`
                    : '연결되지 않음'}
              </div>
              {okxConnection?.last_synced_at && (
                <div className="text-[11px] text-content-muted font-mono mt-1">
                  마지막 동기화: {new Date(okxConnection.last_synced_at).toLocaleString()}
                </div>
              )}
            </div>
            {okxConnection && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteOkxConnection}
                disabled={okxDeleting || okxSyncing}
              >
                {okxDeleting ? '삭제 중...' : '연결 삭제'}
              </Button>
            )}
          </div>

          {okxConnection && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-[160px_160px_auto_auto_auto_1fr] gap-2 items-end">
              <Input
                label="가져오기 시작일"
                type="date"
                value={okxSyncFrom}
                onChange={(e) => setOkxSyncFrom(e.target.value)}
              />
              <Input
                label="가져오기 종료일"
                type="date"
                value={okxSyncTo}
                onChange={(e) => setOkxSyncTo(e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => handleSyncOkxTrades()} disabled={okxSyncing}>
                {okxSyncing ? '가져오는 중...' : '선택 기간'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncOkxTrades(30)} disabled={okxSyncing}>
                30일
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncOkxTrades(90)} disabled={okxSyncing}>
                90일
              </Button>
              <div className="text-[11px] text-content-muted pb-2">
                내부적으로 7일 단위로 나누어 OKX 공식 fills-history를 가져옵니다.
              </div>
            </div>
          )}

          <p className="text-[11px] text-content-muted mt-3">
            OKX는 API v5 Read 권한과 Passphrase가 필요합니다. 가져온 체결은 초안으로 저장됩니다.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm font-medium">Bitget USDT-Futures</div>
              <div className="text-[12px] text-content-muted">
                {bitgetLoading
                  ? '연결 상태 확인 중...'
                  : bitgetConnection
                    ? `연결됨 · ${bitgetConnection.permissions_verified ? '권한 검증 완료' : '권한 미검증'}`
                    : '연결되지 않음'}
              </div>
              {bitgetConnection?.last_synced_at && (
                <div className="text-[11px] text-content-muted font-mono mt-1">
                  마지막 동기화: {new Date(bitgetConnection.last_synced_at).toLocaleString()}
                </div>
              )}
            </div>
            {bitgetConnection && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteBitgetConnection}
                disabled={bitgetDeleting || bitgetSyncing}
              >
                {bitgetDeleting ? '삭제 중...' : '연결 삭제'}
              </Button>
            )}
          </div>

          {bitgetConnection && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-[160px_160px_auto_auto_auto_1fr] gap-2 items-end">
              <Input
                label="가져오기 시작일"
                type="date"
                value={bitgetSyncFrom}
                onChange={(e) => setBitgetSyncFrom(e.target.value)}
              />
              <Input
                label="가져오기 종료일"
                type="date"
                value={bitgetSyncTo}
                onChange={(e) => setBitgetSyncTo(e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => handleSyncBitgetTrades()} disabled={bitgetSyncing}>
                {bitgetSyncing ? '가져오는 중...' : '선택 기간'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncBitgetTrades(30)} disabled={bitgetSyncing}>
                30일
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSyncBitgetTrades(90)} disabled={bitgetSyncing}>
                90일
              </Button>
              <div className="text-[11px] text-content-muted pb-2">
                내부적으로 7일 단위로 나누어 Bitget 공식 order fills를 가져옵니다.
              </div>
            </div>
          )}

          <p className="text-[11px] text-content-muted mt-3">
            Bitget은 Read-only Futures 권한과 Passphrase가 필요합니다. 가져온 체결은 초안으로 저장됩니다.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm font-medium">Flipster</div>
              <div className="text-[12px] text-content-muted">
                {flipsterLoading
                  ? '연결 상태 확인 중...'
                  : flipsterConnection
                    ? `연결됨 · ${flipsterConnection.permissions_verified ? '권한 검증 완료' : '권한 미검증'}`
                    : '연결되지 않음'}
              </div>
              {flipsterConnection?.last_synced_at && (
                <div className="text-[11px] text-content-muted font-mono mt-1">
                  마지막 동기화: {new Date(flipsterConnection.last_synced_at).toLocaleString()}
                </div>
              )}
            </div>
            {flipsterConnection && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteFlipsterConnection}
                disabled={flipsterDeleting}
              >
                {flipsterDeleting ? '삭제 중...' : '연결 삭제'}
              </Button>
            )}
          </div>

          <p className="text-[11px] text-content-muted mt-3">
            Flipster 공식 API는 private launch 상태입니다. 현재는 공식 Account API로 Read 권한 연결 검증과 암호화 저장까지만 지원합니다.
          </p>
        </div>
      </Card>

      {/* 즐겨찾기 종목 관리 */}
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          즐겨찾기 종목
        </h2>
        {favorites.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {favorites.map((symbol) => (
              <span
                key={symbol}
                className="group flex items-center gap-1 px-[10px] py-1 bg-surface-hover rounded-badge text-[12px] font-medium text-content-secondary"
              >
                {symbol}
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(symbol)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-content-muted hover:text-red-400 ml-0.5"
                  title="즐겨찾기 제거"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-content-muted mb-3">
            즐겨찾기가 없습니다. 자주 거래하는 종목을 추가하세요.
          </p>
        )}
        <AssetCombobox
          pickerMode
          favorites={favorites}
          allAssets={allAssets}
          onToggleFavorite={(sym) => { void toggleFavorite(sym) }}
          placeholder="종목 검색 또는 직접 입력 (예: DOGE)"
        />
        <p className="text-[11px] text-content-muted mt-2">
          검색해서 ★ 아이콘 또는 항목을 클릭하면 즐겨찾기에 추가/해제됩니다. 목록에 없는 심볼은 입력 후 Enter로 직접 추가 가능 (전체 {allAssets.length}개).
        </p>
      </Card>

      {/* 목표 자산 */}
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          목표 자산
        </h2>

        {/* 기존 목표 목록 */}
        {targets.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {targets.map((tgt, idx) => {
              const pct = Math.min((capital / tgt.amount) * 100, 100)
              const color = TARGET_COLORS[idx % TARGET_COLORS.length]
              return (
                <div
                  key={tgt.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-[6px] py-[1px] rounded-[3px]"
                      style={{ color, background: `${color}18` }}
                    >
                      T{idx + 1}
                    </span>
                    <span className="text-sm font-medium">{tgt.label}</span>
                    <span className="font-mono text-[12px] text-content-muted">
                      ${formatNumber(tgt.amount, 0)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTarget(tgt.id)}
                  >
                    삭제
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* 목표 추가 폼 */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="목표 이름"
              placeholder="1차 목표"
              value={targetLabel}
              onChange={(e) => setTargetLabel(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Input
              label="목표 금액"
              type="number"
              placeholder="50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleAddTarget}>
            추가
          </Button>
        </div>
      </Card>

      {/* 추가 입금 */}
      <Card className="mb-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] m-0">
            추가 입금
          </h2>
          <span className="font-mono text-sm text-info font-semibold">
            합계: +${formatNumber(tdep)}
          </span>
        </div>

        {/* 기존 입금 목록 */}
        {deposits.length > 0 && (
          <div className="flex flex-col gap-1 mb-4">
            {deposits
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((dep) => (
                <div
                  key={dep.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-content-muted">
                      {dep.date}
                    </span>
                    <span className="font-mono text-sm font-semibold text-info">
                      +${formatNumber(dep.amount)}
                    </span>
                    {dep.memo && (
                      <span className="text-[12px] text-content-muted">
                        {dep.memo}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteDeposit(dep.id)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
          </div>
        )}

        {/* 입금 추가 폼 */}
        <div className="flex gap-2 items-end flex-wrap">
          <div className="w-36">
            <Input
              label="날짜"
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
            />
          </div>
          <div className="w-28">
            <Input
              label="금액 (USDT)"
              type="number"
              placeholder="1000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Input
              label="메모"
              placeholder="입금 사유"
              value={depositMemo}
              onChange={(e) => setDepositMemo(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleAddDeposit}>
            추가
          </Button>
        </div>
      </Card>

      {/* 데이터 관리 */}
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          데이터 관리
        </h2>

        <div className="flex flex-col gap-3">
          {/* JSON 가져오기 */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">기존 데이터 가져오기</div>
              <div className="text-[12px] text-content-muted">
                기존 JSON v4 파일에서 데이터를 마이그레이션합니다.
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
            >
              파일 선택
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void handleImportFile(file)
              }}
            />
          </div>

          <div className="h-px bg-border" />

          {/* CSV 내보내기 */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">CSV 내보내기</div>
              <div className="text-[12px] text-content-muted">
                거래 기록을 CSV 파일로 다운로드합니다.
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (trades.length === 0) {
                  showToast('error', '내보낼 거래 기록이 없습니다.')
                  return
                }
                downloadCsv(`trades_${today()}.csv`, tradesToCsv(trades))
                showToast('success', `${trades.length}건을 CSV로 내보냈습니다.`)
              }}
            >
              내보내기
            </Button>
          </div>

          <div className="h-px bg-border" />

          {/* 데이터 초기화 */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-loss">전체 데이터 초기화</div>
              <div className="text-[12px] text-content-muted">
                모든 거래, 입금, 목표 데이터를 삭제합니다.
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setResetModal(true)}
            >
              초기화
            </Button>
          </div>
        </div>
      </Card>

      {/* 계정 */}
      <Card>
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          계정
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">로그아웃</div>
              <div className="text-[12px] text-content-muted font-mono">
                {profile?.email ?? 'trader@example.com'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        </div>
      </Card>

      {/* JSON import 미리보기 모달 */}
      <Modal
        open={importPreview !== null}
        onClose={() => !importing && setImportPreview(null)}
        title="JSON 가져오기 확인"
        confirmLabel={importing ? '가져오는 중...' : '가져오기'}
        onConfirm={handleConfirmImport}
      >
        {importPreview && (
          <div className="space-y-2 text-sm">
            <div>아래 데이터를 가져옵니다. 기존 데이터는 유지되며 추가됩니다 (덮어쓰지 않음).</div>
            <ul className="list-disc pl-5 text-content-secondary">
              <li>거래 <span className="font-mono">{importPreview.trades.length}</span>건</li>
              <li>입금 <span className="font-mono">{importPreview.deposits.length}</span>건</li>
              <li>목표 <span className="font-mono">{importPreview.targets.length}</span>건</li>
              <li>커스텀 코인 <span className="font-mono">{importPreview.customAssets.length}</span>건</li>
              <li>초기 자산 <span className="font-mono">{importPreview.initialCapital}</span></li>
            </ul>
          </div>
        )}
      </Modal>

      {/* 초기화 확인 모달 */}
      <Modal
        open={resetModal}
        onClose={() => {
          if (resetting) return
          setResetModal(false)
          setResetConfirmText('')
        }}
        title="전체 데이터 초기화"
        confirmLabel={resetting ? '삭제 중...' : '전체 삭제'}
        onConfirm={handleConfirmReset}
        confirmDisabled={resetConfirmText.trim() !== RESET_CONFIRM_PHRASE || resetting}
        danger
      >
        <div className="space-y-3">
          <div>
            아래 데이터가 영구적으로 삭제됩니다. <span className="text-loss font-medium">PITR 외 복구 불가</span>합니다.
          </div>
          <ul className="list-disc pl-5 text-content-secondary space-y-0.5">
            <li>모든 거래 (분할청산 · 추가진입 · 스크린샷 포함)</li>
            <li>입금 · 목표 · 월간/주간 리포트 · 거래 계획</li>
            <li>초기 자산은 0으로 리셋되어 다시 온보딩 페이지로 이동합니다</li>
          </ul>
          <div className="text-content-muted text-[12px]">
            거래소 연결 · 즐겨찾기 · 커스텀 코인 · 구독 정보는 보존됩니다.
          </div>
          <div className="pt-2">
            <label className="block text-[12px] text-content-secondary mb-1.5">
              계속하려면 <span className="font-mono text-content">{RESET_CONFIRM_PHRASE}</span> 를 입력하세요
            </label>
            <Input
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder={RESET_CONFIRM_PHRASE}
              disabled={resetting}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
