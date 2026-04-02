-- ============================================================
-- Trading Journal - 추가진입(물타기/불타기) + 분할청산 close_margin
-- 버전: 2.0
-- 생성일: 2026-04-02
-- 설명: trade_scale_ins 테이블 생성, trade_closes에 close_margin 추가
-- ============================================================

-- ────────────────────────────────────────────
-- 1. trade_scale_ins 테이블 (물타기/불타기)
-- ────────────────────────────────────────────

CREATE TABLE trade_scale_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_price NUMERIC(24,8) NOT NULL CHECK (entry_price > 0),
  margin NUMERIC(18,2) NOT NULL CHECK (margin > 0),
  entry_datetime TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('scale_in_down', 'scale_in_up')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_trade_scale_ins_trade ON trade_scale_ins(trade_id);
CREATE INDEX idx_trade_scale_ins_user ON trade_scale_ins(user_id);

-- RLS
ALTER TABLE trade_scale_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_scale_ins_select_own"
  ON trade_scale_ins FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "trade_scale_ins_insert_own"
  ON trade_scale_ins FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "trade_scale_ins_update_own"
  ON trade_scale_ins FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "trade_scale_ins_delete_own"
  ON trade_scale_ins FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ────────────────────────────────────────────
-- 2. trade_closes에 close_margin 컬럼 추가
-- ────────────────────────────────────────────

ALTER TABLE trade_closes ADD COLUMN close_margin NUMERIC(18,2);

-- 기존 데이터 마이그레이션: close_margin = 부모 trade.margin * quantity_pct / 100
UPDATE trade_closes tc
SET close_margin = (
  SELECT t.margin * tc.quantity_pct / 100
  FROM trades t
  WHERE t.id = tc.trade_id
)
WHERE tc.close_margin IS NULL;
