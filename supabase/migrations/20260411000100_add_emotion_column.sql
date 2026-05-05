ALTER TABLE trades ADD COLUMN emotion TEXT DEFAULT NULL;
ALTER TABLE trades ADD CONSTRAINT trades_emotion_check
  CHECK (emotion IS NULL OR emotion IN ('calm', 'confident', 'fomo', 'revenge', 'anxious'));
