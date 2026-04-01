-- ============================================================
-- Trading Journal - 초기 스키마 마이그레이션
-- 버전: 1.0
-- 생성일: 2026-04-01
-- 설명: profiles, trades, deposits, targets, custom_assets
--       테이블 생성 및 RLS 정책, 인덱스, 트리거 설정
-- ============================================================

-- ────────────────────────────────────────────
-- 1. 테이블 생성
-- ────────────────────────────────────────────

-- 사용자 프로필 (auth.users와 1:1 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  initial_capital NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 거래 기록
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_datetime TIMESTAMPTZ,
  exit_datetime TIMESTAMPTZ,
  asset TEXT NOT NULL,                      -- BTC, ETH, SOL 등
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  leverage INTEGER NOT NULL DEFAULT 10 CHECK (leverage BETWEEN 1 AND 125),
  entry_price NUMERIC(24,8) NOT NULL CHECK (entry_price > 0),
  exit_price NUMERIC(24,8) CHECK (exit_price > 0),
  margin NUMERIC(18,2) NOT NULL CHECK (margin > 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  pnl NUMERIC(18,2),                       -- 실현 손익 (USDT)
  reason TEXT,                              -- 진입 이유
  notes TEXT,                               -- 결과 메모
  tags TEXT[],                              -- P2: 전략 태그
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 추가 입금
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 목표 자산
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사용자 추가 코인
CREATE TABLE custom_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- ────────────────────────────────────────────
-- 2. 인덱스 생성
-- ────────────────────────────────────────────

-- trades: 사용자별 날짜순 조회 (대시보드, 거래 내역)
CREATE INDEX idx_trades_user_date ON trades(user_id, date DESC);

-- trades: 사용자별 상태 조회 (오픈 포지션)
CREATE INDEX idx_trades_user_status ON trades(user_id, status);

-- trades: 사용자별 종목 조회 (코인별 분석)
CREATE INDEX idx_trades_user_asset ON trades(user_id, asset);

-- deposits: 사용자별 날짜순 조회
CREATE INDEX idx_deposits_user_date ON deposits(user_id, date DESC);

-- targets: 사용자별 정렬순서
CREATE INDEX idx_targets_user ON targets(user_id, sort_order);

-- custom_assets: 사용자별 조회
CREATE INDEX idx_custom_assets_user ON custom_assets(user_id);

-- ────────────────────────────────────────────
-- 3. RLS (Row Level Security) 활성화 및 정책
-- ────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_assets ENABLE ROW LEVEL SECURITY;

-- profiles: 자기 프로필만 조회/수정/생성/삭제 가능
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- profiles DELETE: 계정 삭제 시 CASCADE로 모든 관련 데이터 제거
-- 프론트엔드에서 반드시 이중 확인(더블 컨펌)을 받아야 함
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- trades: 자기 거래만 전체 CRUD 가능
CREATE POLICY "trades_select_own"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trades_insert_own"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trades_update_own"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trades_delete_own"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- deposits: 자기 입금 기록만 전체 CRUD 가능
CREATE POLICY "deposits_select_own"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "deposits_insert_own"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deposits_update_own"
  ON deposits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "deposits_delete_own"
  ON deposits FOR DELETE
  USING (auth.uid() = user_id);

-- targets: 자기 목표만 전체 CRUD 가능
CREATE POLICY "targets_select_own"
  ON targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "targets_insert_own"
  ON targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "targets_update_own"
  ON targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "targets_delete_own"
  ON targets FOR DELETE
  USING (auth.uid() = user_id);

-- custom_assets: 자기 커스텀 코인만 전체 CRUD 가능
CREATE POLICY "custom_assets_select_own"
  ON custom_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "custom_assets_insert_own"
  ON custom_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_assets_update_own"
  ON custom_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "custom_assets_delete_own"
  ON custom_assets FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- 4. updated_at 자동 갱신 트리거
-- ────────────────────────────────────────────

-- updated_at 컬럼을 자동으로 현재 시각으로 갱신하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블에 적용
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- trades 테이블에 적용
CREATE TRIGGER trigger_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────
-- 5. auth.users → profiles 자동 생성 트리거
-- ────────────────────────────────────────────

-- 새 사용자가 auth.users에 등록되면 profiles 테이블에 자동 INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────
-- 6. 마이그레이션 일괄 INSERT용 RPC 함수
-- ────────────────────────────────────────────

-- JSON v4 데이터를 단일 트랜잭션으로 마이그레이션하는 RPC
-- 실패 시 자동 롤백 (PostgreSQL 트랜잭션 특성)
CREATE OR REPLACE FUNCTION migrate_json_data(
  p_user_id UUID,
  p_initial_capital NUMERIC,
  p_trades JSONB,
  p_deposits JSONB,
  p_targets JSONB,
  p_custom_assets JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade_count INTEGER := 0;
  v_deposit_count INTEGER := 0;
  v_target_count INTEGER := 0;
  v_asset_count INTEGER := 0;
  v_trade JSONB;
  v_deposit JSONB;
  v_target JSONB;
  v_asset TEXT;
  v_sort_idx INTEGER := 0;
BEGIN
  -- 호출자가 본인인지 확인
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION '권한 없음: 본인의 데이터만 마이그레이션할 수 있습니다.';
  END IF;

  -- 1. 프로필 초기 자산 업데이트
  UPDATE profiles
  SET initial_capital = p_initial_capital,
      updated_at = now()
  WHERE id = p_user_id;

  -- 2. 거래 데이터 INSERT
  FOR v_trade IN SELECT * FROM jsonb_array_elements(p_trades)
  LOOP
    INSERT INTO trades (
      user_id, date, entry_datetime, exit_datetime,
      asset, direction, leverage, entry_price, exit_price,
      margin, status, pnl, reason, notes
    ) VALUES (
      p_user_id,
      (v_trade->>'date')::DATE,
      CASE WHEN v_trade->>'entryDatetime' IS NOT NULL
           THEN (v_trade->>'entryDatetime')::TIMESTAMPTZ
           ELSE NULL END,
      CASE WHEN v_trade->>'exitDatetime' IS NOT NULL
           THEN (v_trade->>'exitDatetime')::TIMESTAMPTZ
           ELSE NULL END,
      v_trade->>'asset',
      v_trade->>'direction',
      (v_trade->>'leverage')::INTEGER,
      (v_trade->>'entryPrice')::NUMERIC,
      CASE WHEN v_trade->>'exitPrice' IS NOT NULL
           THEN (v_trade->>'exitPrice')::NUMERIC
           ELSE NULL END,
      (v_trade->>'margin')::NUMERIC,
      COALESCE(v_trade->>'status', 'closed'),
      CASE WHEN v_trade->>'pnl' IS NOT NULL
           THEN (v_trade->>'pnl')::NUMERIC
           ELSE NULL END,
      v_trade->>'reason',
      v_trade->>'notes'
    );
    v_trade_count := v_trade_count + 1;
  END LOOP;

  -- 3. 입금 데이터 INSERT
  FOR v_deposit IN SELECT * FROM jsonb_array_elements(p_deposits)
  LOOP
    INSERT INTO deposits (user_id, date, amount, memo)
    VALUES (
      p_user_id,
      (v_deposit->>'date')::DATE,
      (v_deposit->>'amount')::NUMERIC,
      v_deposit->>'memo'
    );
    v_deposit_count := v_deposit_count + 1;
  END LOOP;

  -- 4. 목표 데이터 INSERT
  v_sort_idx := 0;
  FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
  LOOP
    INSERT INTO targets (user_id, label, amount, sort_order)
    VALUES (
      p_user_id,
      v_target->>'label',
      (v_target->>'amount')::NUMERIC,
      v_sort_idx
    );
    v_sort_idx := v_sort_idx + 1;
    v_target_count := v_target_count + 1;
  END LOOP;

  -- 5. 커스텀 코인 INSERT
  FOR v_asset IN SELECT * FROM jsonb_array_elements_text(p_custom_assets)
  LOOP
    INSERT INTO custom_assets (user_id, symbol)
    VALUES (p_user_id, v_asset)
    ON CONFLICT (user_id, symbol) DO NOTHING;
    v_asset_count := v_asset_count + 1;
  END LOOP;

  -- 결과 리포트 반환
  RETURN jsonb_build_object(
    'success', true,
    'trades', v_trade_count,
    'deposits', v_deposit_count,
    'targets', v_target_count,
    'custom_assets', v_asset_count
  );
END;
$$;
