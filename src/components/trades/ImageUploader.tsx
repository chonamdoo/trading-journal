'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { TradeScreenshot } from '@/types'
import { showToast } from '@/components/ui/Toast'

const MAX_FILES = 1
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85

interface ImageUploaderProps {
  /** 아직 업로드되지 않은 대기 파일 */
  files: File[]
  onChange: (files: File[]) => void
  /** 이미 업로드된 스크린샷 (수정 모드) */
  existingScreenshots?: TradeScreenshot[]
  onDeleteExisting?: (id: string, storagePath: string) => void
}

/** 터치 기기 여부를 판별한다 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 이미지를 최대 MAX_DIMENSION px로 리사이즈하고 JPEG 압축한다.
 * 이미 충분히 작은 이미지는 그대로 반환한다.
 */
function resizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // GIF는 리사이즈하지 않는다 (애니메이션 보존)
    if (file.type === 'image/gif') {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { width, height } = img

      // 리사이즈가 필요 없으면 원본 반환
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(file)
        return
      }

      // 비율 유지하면서 축소
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
      const newWidth = Math.round(width * ratio)
      const newHeight = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const resizedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(resizedFile)
        },
        'image/jpeg',
        JPEG_QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`이미지 로드 실패: ${file.name}`))
    }

    img.src = url
  })
}

/**
 * 이미지 업로더 컴포넌트
 * 파일 선택, 드래그앤드롭, 클립보드 붙여넣기를 지원한다.
 */
export function ImageUploader({
  files,
  onChange,
  existingScreenshots = [],
  onDeleteExisting,
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [isTouchMode, setIsTouchMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // SSR hydration mismatch 방지: 클라이언트에서만 터치 여부 판별
  useEffect(() => {
    setIsTouchMode(isTouchDevice())
  }, [])

  // 파일 유효성 검사 후 단일 파일 대체
  const addFiles = useCallback(
    async (incoming: File[]) => {
      // 첫 번째 유효 파일만 사용
      let validFile: File | null = null
      for (const f of incoming) {
        if (!ALLOWED_TYPES.includes(f.type)) {
          showToast('error', `이미지만 업로드 가능합니다: ${f.name}`)
          continue
        }
        if (f.size > MAX_SIZE_BYTES) {
          showToast('error', `${MAX_SIZE_MB}MB 초과: ${f.name}`)
          continue
        }
        validFile = f
        break
      }

      if (!validFile) return

      try {
        const resized = await resizeImage(validFile)
        onChange([resized])
      } catch {
        // 리사이즈 실패 시 원본 사용
        onChange([validFile])
      }
    },
    [onChange],
  )

  // 파일 삭제 (대기 목록)
  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx))
  }

  // 드래그앤드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    addFiles(dropped)
  }

  // 클립보드 붙여넣기
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault()
        addFiles(imageFiles)
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [addFiles])

  // ObjectURL 메모리 누수 방지: files가 바뀔 때만 생성하고, 이전 URL은 revoke
  const objectUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  // 라이트박스용 ObjectURL도 언마운트 또는 변경 시 revoke (외부 URL이 아닌 경우만)
  useEffect(() => {
    return () => {
      if (lightboxUrl && lightboxUrl.startsWith('blob:')) {
        URL.revokeObjectURL(lightboxUrl)
      }
    }
  }, [lightboxUrl])

  const dropzoneText = isTouchMode
    ? '탭하여 이미지 첨부'
    : '클릭, 드래그 또는 Ctrl+V로 이미지 첨부'

  return (
    <>
      <div className="flex flex-col gap-sp-4">
        <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
          스크린샷
        </label>

        {/* 드롭존 */}
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 py-6 px-4
            border-2 border-dashed rounded-input cursor-pointer transition-colors
            ${dragging
              ? 'border-info bg-info-soft'
              : 'border-border hover:border-border-input'
            }
          `}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-content-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-[12px] text-content-muted text-center">
            {dropzoneText}
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(Array.from(e.target.files))
              e.target.value = ''
            }
          }}
        />

        {/* 썸네일 목록 */}
        {(existingScreenshots.length > 0 || files.length > 0) && (
          <div className="flex gap-2 flex-wrap">
            {/* 기존 업로드된 이미지 */}
            {existingScreenshots.map((ss) => (
              <div key={ss.id} className="relative group">
                <img
                  src={ss.url}
                  alt={ss.file_name}
                  className="w-[72px] h-[72px] object-cover rounded-badge border border-border cursor-pointer"
                  onClick={() => setLightboxUrl(ss.url)}
                />
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteExisting(ss.id, ss.storage_path)
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-loss text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {/* 대기 중 파일 */}
            {files.map((f, i) => (
              <div key={`pending-${i}`} className="relative group">
                <img
                  src={objectUrls[i]}
                  alt={f.name}
                  className="w-[72px] h-[72px] object-cover rounded-badge border border-border border-dashed cursor-pointer"
                  onClick={() => setLightboxUrl(objectUrls[i])}
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-loss text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="스크린샷"
            className="max-w-full max-h-full object-contain rounded-card"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white text-xl flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}
