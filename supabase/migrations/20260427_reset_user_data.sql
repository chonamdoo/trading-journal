-- SPEC-011: 사용자 데이터 일괄 초기화 RPC.
-- 단일 트랜잭션 안에서 거래/입금/목표/리포트/플랜 삭제 + initial_capital 리셋.
-- Storage 파일은 application layer (/api/reset)에서 별도로 처리.
-- search_path = '' + 완전수식 + auth.uid() 가드 (security/core.md SSOT).

CREATE OR REPLACE FUNCTION reset_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_trades INTEGER := 0;
  v_deposits INTEGER := 0;
  v_targets INTEGER := 0;
  v_monthly INTEGER := 0;
  v_weekly INTEGER := 0;
  v_plans INTEGER := 0;
BEGIN
  -- 호출자가 본인인지 확인
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION '권한 없음: 본인의 데이터만 초기화할 수 있습니다.';
  END IF;

  -- 1. 거래 (CASCADE: trade_closes, trade_scale_ins, trade_screenshots)
  WITH d AS (
    DELETE FROM public.trades WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_trades FROM d;

  -- 2. 입금
  WITH d AS (
    DELETE FROM public.deposits WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_deposits FROM d;

  -- 3. 목표
  WITH d AS (
    DELETE FROM public.targets WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_targets FROM d;

  -- 4. 월간 리포트
  WITH d AS (
    DELETE FROM public.monthly_reports WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_monthly FROM d;

  -- 5. 주간 리포트
  WITH d AS (
    DELETE FROM public.weekly_reports WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_weekly FROM d;

  -- 6. 거래 계획
  WITH d AS (
    DELETE FROM public.trading_plans WHERE user_id = p_user_id RETURNING 1
  )
  SELECT count(*) INTO v_plans FROM d;

  -- 7. 초기 자산 리셋 — onboarding 가드 재트리거
  UPDATE public.profiles
  SET initial_capital = 0,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'trades', v_trades,
    'deposits', v_deposits,
    'targets', v_targets,
    'monthly_reports', v_monthly,
    'weekly_reports', v_weekly,
    'trading_plans', v_plans
  );
END;
$$;

-- 권한 — 인증된 사용자만 호출 가능
REVOKE ALL ON FUNCTION reset_user_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reset_user_data(UUID) TO authenticated;
