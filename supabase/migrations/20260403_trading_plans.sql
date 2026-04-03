-- ============================================
-- 트레이딩 플랜 테이블
-- ============================================

CREATE TABLE trading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),

  entry_conditions TEXT NOT NULL,
  entry_price_min NUMERIC(24,8),
  entry_price_max NUMERIC(24,8),

  target_prices JSONB NOT NULL DEFAULT '[]'::jsonb,
  stop_loss_price NUMERIC(24,8),

  risk_reward_ratio NUMERIC(5,2),
  position_size_plan TEXT,
  leverage_plan INTEGER CHECK (leverage_plan IS NULL OR leverage_plan BETWEEN 1 AND 125),
  margin_plan NUMERIC(18,2),

  confidence_level INTEGER NOT NULL DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
  market_analysis TEXT,
  invalidation_conditions TEXT,

  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'linked', 'expired', 'archived')),

  linked_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ,

  review_notes TEXT,
  plan_adherence INTEGER CHECK (plan_adherence IS NULL OR plan_adherence BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_trading_plans_user_status ON trading_plans(user_id, status, created_at DESC);
CREATE INDEX idx_trading_plans_user_asset ON trading_plans(user_id, asset);
CREATE INDEX idx_trading_plans_linked_trade ON trading_plans(linked_trade_id) WHERE linked_trade_id IS NOT NULL;

-- RLS
ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trading_plans_select_own"
  ON trading_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trading_plans_insert_own"
  ON trading_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trading_plans_update_own"
  ON trading_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trading_plans_delete_own"
  ON trading_plans FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 트리거 (기존 함수 재사용)
CREATE TRIGGER trigger_trading_plans_updated_at
  BEFORE UPDATE ON trading_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
