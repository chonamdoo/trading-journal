-- monthly_reports에 stats JSONB 컬럼 추가 (AI 구조화 데이터 저장)
ALTER TABLE monthly_reports ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT NULL;
