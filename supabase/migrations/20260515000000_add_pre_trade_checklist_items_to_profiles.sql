ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pre_trade_checklist_items JSONB NOT NULL DEFAULT '[
  {"id": "hasStopLoss", "label": "손절가(SL)를 설정했는가?"},
  {"id": "withinRiskLimit", "label": "총 자산의 2% 이내의 리스크인가?"},
  {"id": "notChasing", "label": "추격 매수가 아닌가?"}
]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_pre_trade_checklist_items_array'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_pre_trade_checklist_items_array
    CHECK (jsonb_typeof(pre_trade_checklist_items) = 'array');
  END IF;
END $$;

COMMENT ON COLUMN profiles.pre_trade_checklist_items IS '사용자별 프리트레이드 체크리스트 항목 JSON 배열';
