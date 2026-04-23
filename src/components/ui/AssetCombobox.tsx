'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface AssetComboboxProps {
  /** 현재 선택값 (select 모드에서만 의미 있음) */
  value?: string
  /** 선택 핸들러 (select 모드에서만 호출) */
  onChange?: (value: string) => void
  /** 즐겨찾기된 심볼 목록 */
  favorites: string[]
  /** 최근 거래 종목 (picker 모드에서는 무시) */
  recent?: string[]
  /** 전체 종목 (DEFAULT_ASSETS + custom_assets) */
  allAssets: string[]
  /** 즐겨찾기 토글 핸들러 (picker 모드 필수) */
  onToggleFavorite?: (symbol: string) => void
  placeholder?: string
  /**
   * picker 모드: 항목 클릭 = 즐겨찾기 토글 (select 아님).
   * 드롭다운이 자동으로 닫히지 않아 여러 개 연속 토글 가능.
   * 설정 페이지 등 "즐겨찾기 관리 전용" 용도.
   */
  pickerMode?: boolean
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  )
}

/**
 * 종목 선택 Combobox
 * 즐겨찾기(칩) → 최근 거래 → 전체 검색 3단 구조
 */
export function AssetCombobox({
  value = '',
  onChange,
  favorites,
  recent = [],
  allAssets,
  onToggleFavorite,
  placeholder = '종목 검색...',
  pickerMode = false,
}: AssetComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const favoriteSet = useMemo(() => new Set(favorites), [favorites])

  const handleToggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(symbol)
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // 검색 필터링
  const filtered = useMemo(() => {
    if (!search) return allAssets
    const q = search.toUpperCase()
    return allAssets.filter((a) => a.includes(q))
  }, [search, allAssets])

  // 최근 거래 (즐겨찾기 제외)
  const recentFiltered = useMemo(() => {
    const favSet = new Set(favorites)
    return recent.filter((a) => !favSet.has(a))
  }, [recent, favorites])

  const handleSelect = (asset: string) => {
    if (pickerMode) {
      // picker 모드: 선택 = 즐겨찾기 토글. 드롭다운 유지, 검색어만 초기화
      onToggleFavorite?.(asset)
      setSearch('')
      inputRef.current?.focus()
      return
    }
    onChange?.(asset)
    setOpen(false)
    setSearch('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase()
    setSearch(v)
    if (!open) setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search) {
      e.preventDefault()
      // 검색어가 정확히 매칭되면 선택, 아니면 직접 입력
      const exact = allAssets.find((a) => a === search)
      handleSelect(exact || search)
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 입력 필드 */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-input border border-border-input bg-surface text-[13px] cursor-text focus-within:ring-1 focus-within:ring-accent-primary focus-within:border-accent-primary transition-colors"
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        {!pickerMode && value && !open && (
          <span className="font-mono font-semibold text-content">{value}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={open ? search : ''}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={!pickerMode && value && !open ? '' : placeholder}
          className="flex-1 bg-transparent outline-none font-mono text-[13px] placeholder:text-content-muted min-w-0"
        />
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-content-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-input shadow-md max-h-[60vh] overflow-y-auto">
          {/* 즐겨찾기 */}
          {favorites.length > 0 && !search && (
            <div className="px-3 pt-3 pb-2">
              <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                즐겨찾기
              </div>
              <div className="flex flex-wrap gap-1.5">
                {favorites.map((a) => (
                  <div
                    key={a}
                    className={`group flex items-center rounded-full text-[11px] font-mono font-semibold border transition-colors ${
                      value === a
                        ? 'bg-accent-primary/15 border-accent-primary/30 text-accent-primary'
                        : 'bg-surface-hover border-border text-content-secondary hover:border-accent-primary/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(a)}
                      className="pl-2.5 pr-1.5 py-1"
                    >
                      {a}
                    </button>
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleToggleFavorite(a, e)}
                        className="pr-2 py-1 text-amber-400 hover:text-amber-500"
                        aria-label={`${a} 즐겨찾기 해제`}
                        title="즐겨찾기 해제"
                      >
                        <StarIcon filled={true} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 거래 (picker 모드에서는 숨김) */}
          {!pickerMode && recentFiltered.length > 0 && !search && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1.5">
                최근 거래
              </div>
              {recentFiltered.map((a) => {
                const isFav = favoriteSet.has(a)
                return (
                  <div
                    key={a}
                    className="group flex items-center gap-1 rounded hover:bg-surface-hover transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(a)}
                      className="flex-1 text-left px-2 py-1.5 text-[12px] font-mono text-content-secondary"
                    >
                      {a}
                    </button>
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleToggleFavorite(a, e)}
                        className={`px-2 py-1.5 transition-colors ${
                          isFav
                            ? 'text-amber-400'
                            : 'text-content-muted opacity-0 group-hover:opacity-100 hover:text-amber-400'
                        }`}
                        aria-label={isFav ? `${a} 즐겨찾기 해제` : `${a} 즐겨찾기`}
                        title={isFav ? '즐겨찾기 해제' : '즐겨찾기'}
                      >
                        <StarIcon filled={isFav} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 구분선 */}
          {(favorites.length > 0 || (!pickerMode && recentFiltered.length > 0)) && !search && (
            <div className="h-px bg-border mx-3 my-1" />
          )}

          {/* 전체 종목 / 검색 결과 */}
          <div className="px-3 pt-2 pb-2">
            {search && (
              <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1.5">
                검색 결과 ({filtered.length})
              </div>
            )}
            {!search && allAssets.length > 0 && (
              <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1.5">
                전체 종목 ({allAssets.length})
              </div>
            )}
            <div className="max-h-[40vh] overflow-y-auto">
              {filtered.map((a) => {
                const isFav = favoriteSet.has(a)
                const selected = !pickerMode && value === a
                return (
                  <div
                    key={a}
                    className={`group flex items-center gap-1 rounded transition-colors ${
                      selected
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : 'hover:bg-surface-hover text-content-secondary'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(a)}
                      className={`flex-1 text-left px-2 py-1.5 text-[12px] font-mono ${
                        selected ? 'font-semibold' : ''
                      }`}
                    >
                      {a}
                    </button>
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleToggleFavorite(a, e)}
                        className={`px-2 py-1.5 transition-colors ${
                          isFav
                            ? 'text-amber-400'
                            : 'text-content-muted opacity-0 group-hover:opacity-100 hover:text-amber-400'
                        }`}
                        aria-label={isFav ? `${a} 즐겨찾기 해제` : `${a} 즐겨찾기`}
                        title={isFav ? '즐겨찾기 해제' : '즐겨찾기'}
                      >
                        <StarIcon filled={isFav} />
                      </button>
                    )}
                  </div>
                )
              })}
              {filtered.length === 0 && search && (
                <button
                  type="button"
                  onClick={() => handleSelect(search)}
                  className="w-full text-left px-2 py-1.5 rounded text-[12px] font-mono hover:bg-surface-hover text-accent-primary"
                >
                  &quot;{search}&quot; 직접 입력
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
