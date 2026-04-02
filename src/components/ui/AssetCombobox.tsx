'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface AssetComboboxProps {
  value: string
  onChange: (value: string) => void
  /** 즐겨찾기 (custom_assets) */
  favorites: string[]
  /** 최근 거래 종목 */
  recent: string[]
  /** 전체 종목 (supported_assets) */
  allAssets: string[]
  placeholder?: string
}

/**
 * 종목 선택 Combobox
 * 즐겨찾기(칩) → 최근 거래 → 전체 검색 3단 구조
 */
export function AssetCombobox({
  value,
  onChange,
  favorites,
  recent,
  allAssets,
  placeholder = '종목 검색...',
}: AssetComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    onChange(asset)
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
        {value && !open && (
          <span className="font-mono font-semibold text-content">{value}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={open ? search : ''}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value && !open ? '' : placeholder}
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
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleSelect(a)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border transition-colors ${
                      value === a
                        ? 'bg-accent-primary/15 border-accent-primary/30 text-accent-primary'
                        : 'bg-surface-hover border-border text-content-secondary hover:border-accent-primary/30'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 최근 거래 */}
          {recentFiltered.length > 0 && !search && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1.5">
                최근 거래
              </div>
              {recentFiltered.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => handleSelect(a)}
                  className="w-full text-left px-2 py-1.5 rounded text-[12px] font-mono hover:bg-surface-hover transition-colors text-content-secondary"
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* 구분선 */}
          {(favorites.length > 0 || recentFiltered.length > 0) && !search && (
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
              {filtered.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => handleSelect(a)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[12px] font-mono transition-colors ${
                    value === a
                      ? 'bg-accent-primary/10 text-accent-primary font-semibold'
                      : 'hover:bg-surface-hover text-content-secondary'
                  }`}
                >
                  {a}
                </button>
              ))}
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
