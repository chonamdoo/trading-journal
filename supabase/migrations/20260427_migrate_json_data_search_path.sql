-- SPEC-010 보안 보강: migrate_json_data RPC의 SECURITY DEFINER가 search_path = public 으로 노출되어 있던 것을
-- security/core.md SSOT에 따라 search_path = '' + 완전수식 테이블명으로 재정의.
-- 동작 변경 없음 (스키마/시그니처/리턴 동일), 검색 경로만 강화.

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
SET search_path = ''
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
  UPDATE public.profiles
  SET initial_capital = p_initial_capital,
      updated_at = now()
  WHERE id = p_user_id;

  -- 2. 거래 데이터 INSERT
  FOR v_trade IN SELECT * FROM jsonb_array_elements(p_trades)
  LOOP
    INSERT INTO public.trades (
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
    INSERT INTO public.deposits (user_id, date, amount, memo)
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
    INSERT INTO public.targets (user_id, label, amount, sort_order)
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
    INSERT INTO public.custom_assets (user_id, symbol)
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
