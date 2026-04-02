-- ============================================================
-- 003: supported_assets 테이블 (바이낸스 선물 종목 싱크)
-- ============================================================

-- 전체 유저 공용 테이블 (RLS 불필요)
CREATE TABLE IF NOT EXISTS supported_assets (
  symbol TEXT PRIMARY KEY,          -- e.g. 'BTCUSDT' → 'BTC'로 변환하여 저장
  base_asset TEXT NOT NULL,         -- 원본 base asset (e.g. 'BTC')
  quote_asset TEXT NOT NULL DEFAULT 'USDT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 검색 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_supported_assets_base ON supported_assets(base_asset);
CREATE INDEX IF NOT EXISTS idx_supported_assets_active ON supported_assets(is_active) WHERE is_active = true;

-- RLS 비활성화 (공용 읽기 전용 데이터)
ALTER TABLE supported_assets ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 유저가 읽기 가능
CREATE POLICY "Authenticated users can read supported_assets"
  ON supported_assets FOR SELECT
  TO authenticated
  USING (true);
