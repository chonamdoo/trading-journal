'use client'

import { useState } from 'react'
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
import { curCapital, totalPnL, totalReturnPct, totalDeposits } from '@/lib/calc'
import { formatNumber, formatPnl, toKrw, today, genId } from '@/lib/format'
import { TARGET_COLORS } from '@/lib/constants'

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
              onClick={() => showToast('info', 'Supabase 연동 후 사용 가능합니다.')}
            >
              파일 선택
            </Button>
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
              onClick={() => showToast('info', '준비 중입니다.')}
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

      {/* 초기화 확인 모달 */}
      <Modal
        open={resetModal}
        onClose={() => setResetModal(false)}
        title="데이터 초기화"
        confirmLabel="전체 삭제"
        onConfirm={() => {
          setResetModal(false)
          showToast('info', '초기화 기능은 Supabase 연동 후 사용 가능합니다.')
        }}
        danger
      >
        모든 거래, 입금, 목표 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </>
  )
}
