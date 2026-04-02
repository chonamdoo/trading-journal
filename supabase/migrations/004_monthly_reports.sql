-- ============================================
-- 004: AI 월간 리포트 테이블
-- ============================================

CREATE TABLE monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trade_count INT NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,2),
  total_pnl NUMERIC(12,2),
  report_markdown TEXT NOT NULL,
  model_used TEXT DEFAULT 'gemini-2.0-flash',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- RLS 활성화
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- 본인 리포트만 조회
CREATE POLICY "Users can read own reports"
  ON monthly_reports FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 리포트 생성
CREATE POLICY "Users can insert own reports"
  ON monthly_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 리포트 수정 (재생성 시 덮어쓰기)
CREATE POLICY "Users can update own reports"
  ON monthly_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- 본인 리포트 삭제
CREATE POLICY "Users can delete own reports"
  ON monthly_reports FOR DELETE
  USING (auth.uid() = user_id);
