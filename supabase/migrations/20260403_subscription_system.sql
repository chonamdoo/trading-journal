-- ============================================================
-- 구독 시스템 DB 스키마
-- 1) profiles 테이블에 tier/만료일 컬럼 추가
-- 2) subscription_plans 테이블 (플랜 정의)
-- 3) subscriptions 테이블 (구독 이력)
-- ============================================================

-- -------------------------------------------------
-- 1. profiles 확장: 빠른 조회용 tier + 만료일
-- -------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN subscription_expires_at TIMESTAMPTZ NULL;

-- tier 값 제한
ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro'));

-- -------------------------------------------------
-- 2. subscription_plans: 플랜 정의 (관리자용)
-- -------------------------------------------------
CREATE TABLE subscription_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                  -- '무료', '프로 월간', '프로 연간'
  tier          TEXT NOT NULL,                  -- 'free', 'pro'
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'KRW',
  interval      TEXT NOT NULL DEFAULT 'month',  -- 'month', 'year', 'lifetime', 'free'
  features      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT subscription_plans_tier_check
    CHECK (tier IN ('free', 'pro')),
  CONSTRAINT subscription_plans_interval_check
    CHECK (interval IN ('month', 'year', 'lifetime', 'free')),
  CONSTRAINT subscription_plans_price_check
    CHECK (price >= 0)
);

-- updated_at 자동 갱신
CREATE TRIGGER trigger_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------
-- 3. subscriptions: 사용자 구독 이력
-- -------------------------------------------------
CREATE TABLE subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                   UUID NOT NULL REFERENCES subscription_plans(id),
  status                    TEXT NOT NULL DEFAULT 'active',
  started_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                TIMESTAMPTZ NULL,
  cancelled_at              TIMESTAMPTZ NULL,
  -- 결제 PG 연동용 (나중에 사용)
  payment_provider          TEXT NULL,          -- 'toss', 'stripe', etc.
  provider_subscription_id  TEXT NULL,          -- PG사 구독 ID
  provider_customer_id      TEXT NULL,          -- PG사 고객 ID
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due'))
);

-- 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at) WHERE status = 'active';

-- updated_at 자동 갱신
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------
-- 4. RLS 정책
-- -------------------------------------------------

-- subscription_plans: 모든 인증 사용자가 조회 가능 (관리자만 수정 — 추후 admin role)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_plans_select_all" ON subscription_plans
  FOR SELECT TO authenticated
  USING (true);

-- subscriptions: 본인 구독만 조회
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE 정책 없음 — 구독 이력은 삭제 불가 (CASCADE로만 삭제)

-- -------------------------------------------------
-- 5. 기본 플랜 데이터 삽입
-- -------------------------------------------------
INSERT INTO subscription_plans (name, tier, price, currency, interval, sort_order, features) VALUES
  ('무료', 'free', 0, 'KRW', 'free', 0, '{
    "max_trades_per_month": 30,
    "max_screenshots_per_trade": 1,
    "max_active_plans": 3,
    "ai_report": false,
    "share_card_watermark": true,
    "data_export": false
  }'::jsonb),
  ('프로 월간', 'pro', 9900, 'KRW', 'month', 1, '{
    "max_trades_per_month": -1,
    "max_screenshots_per_trade": 5,
    "max_active_plans": -1,
    "ai_report": true,
    "share_card_watermark": false,
    "data_export": true
  }'::jsonb),
  ('프로 연간', 'pro', 99000, 'KRW', 'year', 2, '{
    "max_trades_per_month": -1,
    "max_screenshots_per_trade": 5,
    "max_active_plans": -1,
    "ai_report": true,
    "share_card_watermark": false,
    "data_export": true
  }'::jsonb);
