-- ================================================
-- 데모 계정 시드 데이터
-- ================================================
-- 사용법:
-- 1. Supabase 대시보드에서 데모 계정 생성 (Authentication > Users > Add user)
--    이메일: demo@mytradelog.app / 비밀번호: Demo1234!
-- 2. 생성된 UUID를 아래 변수에 입력
-- 3. Supabase SQL Editor에서 실행
-- ================================================

DO $$
DECLARE
  uid UUID := '1a1edebd-58a2-4f05-8579-6f4edd2bcd92';
  t1  UUID; t2  UUID; t3  UUID; t4  UUID; t5  UUID;
  t6  UUID; t7  UUID; t8  UUID; t9  UUID; t10 UUID;
  t11 UUID; t12 UUID; t13 UUID; t14 UUID; t15 UUID;
  t16 UUID; t17 UUID; t18 UUID; t19 UUID; t20 UUID;
  t21 UUID; t22 UUID; t23 UUID; t24 UUID; t25 UUID;
  t26 UUID; t27 UUID; t28 UUID; t29 UUID; t30 UUID;
  t31 UUID; t32 UUID; t33 UUID; t34 UUID; t35 UUID;
  t36 UUID; t37 UUID; t38 UUID; t39 UUID; t40 UUID;
BEGIN

-- ── 프로필 업데이트 ──
UPDATE profiles
SET initial_capital = 1000, display_name = 'Demo Trader', currency = 'USDT'
WHERE id = uid;

-- ── 추가입금 ──
INSERT INTO deposits (user_id, date, amount, memo) VALUES
  (uid, '2026-03-05', 500,  '초기 추가입금'),
  (uid, '2026-03-18', 300,  '수익금 재투자');

-- ── 목표 설정 ──
INSERT INTO targets (user_id, label, amount, sort_order) VALUES
  (uid, '$2,000 달성',  2000,  0),
  (uid, '$5,000 달성',  5000,  1),
  (uid, '$10,000 달성', 10000, 2);

-- ── 거래 데이터 (40건, 2026년 3월) ──
-- 25승 15패, 승률 62.5%, 총 PnL ≈ +185 USDT

-- BTC 거래 (12건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-01', '2026-03-01T09:15:00Z', '2026-03-01T14:30:00Z', 'BTC', 'LONG',  10, 87250.00, 88100.00, 50.00, 'closed', 4.87, '4시간봉 지지선 반등 + RSI 과매도', '목표가 도달, 깔끔한 진입', '{추세추종,지지저항}')
RETURNING id INTO t1;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-02', '2026-03-02T03:20:00Z', '2026-03-02T08:45:00Z', 'BTC', 'SHORT', 15, 88400.00, 87800.00, 40.00, 'closed', 4.07, '과열 구간 숏 진입, 거래량 감소 확인', '분할 익절 성공', '{역추세,거래량}')
RETURNING id INTO t2;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-04', '2026-03-04T11:00:00Z', '2026-03-04T16:20:00Z', 'BTC', 'LONG',  10, 86900.00, 86400.00, 60.00, 'closed', -3.45, '일봉 지지선 롱, 하방 이탈', '손절 늦었음, 반성', '{지지저항}')
RETURNING id INTO t3;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-06', '2026-03-06T02:10:00Z', '2026-03-06T09:00:00Z', 'BTC', 'LONG',  20, 85800.00, 86500.00, 35.00, 'closed', 5.69, '급락 후 V자 반등 포착', '타이밍 좋았음', '{반등매매}')
RETURNING id INTO t4;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-07', '2026-03-07T14:30:00Z', '2026-03-07T20:15:00Z', 'BTC', 'SHORT', 10, 87100.00, 87500.00, 50.00, 'closed', -2.30, 'CPI 발표 전 숏, 결과 비둘기파', '매크로 이벤트 예측 실패', '{매크로,뉴스}')
RETURNING id INTO t5;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-10', '2026-03-10T06:45:00Z', '2026-03-10T12:00:00Z', 'BTC', 'LONG',  15, 88200.00, 89100.00, 45.00, 'closed', 6.89, '골든크로스 확인 후 진입', '추세 초기에 잡음', '{추세추종,이평선}')
RETURNING id INTO t6;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-12', '2026-03-12T10:00:00Z', '2026-03-12T15:30:00Z', 'BTC', 'LONG',  10, 89500.00, 89200.00, 55.00, 'closed', -1.84, '전고점 돌파 기대했으나 실패', '가짜 돌파에 당함', '{돌파매매}')
RETURNING id INTO t7;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-14', '2026-03-14T01:30:00Z', '2026-03-14T07:00:00Z', 'BTC', 'SHORT', 12, 89800.00, 88900.00, 40.00, 'closed', 4.81, '더블탑 패턴 완성, 넥라인 이탈', '교과서적 패턴', '{패턴매매}')
RETURNING id INTO t8;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-17', '2026-03-17T08:20:00Z', '2026-03-17T13:45:00Z', 'BTC', 'LONG',  10, 87600.00, 88300.00, 50.00, 'closed', 3.99, '주봉 지지 확인 + OBV 상승', '안정적 수익', '{추세추종}')
RETURNING id INTO t9;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-20', '2026-03-20T15:00:00Z', '2026-03-20T21:30:00Z', 'BTC', 'LONG',  20, 88800.00, 88500.00, 30.00, 'closed', -2.03, 'FOMC 전 롱, 매파적 발언', '이벤트 매매 재고 필요', '{매크로}')
RETURNING id INTO t10;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-24', '2026-03-24T04:00:00Z', '2026-03-24T10:30:00Z', 'BTC', 'LONG',  10, 87200.00, 88000.00, 55.00, 'closed', 5.04, '일봉 양봉 돌파 매수', '교과서적 진입', '{돌파매매}')
RETURNING id INTO t11;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-28', '2026-03-28T12:15:00Z', '2026-03-28T18:00:00Z', 'BTC', 'SHORT', 15, 89200.00, 88600.00, 35.00, 'closed', 3.53, '4h RSI 다이버전스 숏', '다이버전스 적중', '{역추세,RSI}')
RETURNING id INTO t12;

-- ETH 거래 (8건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-01', '2026-03-01T10:30:00Z', '2026-03-01T16:00:00Z', 'ETH', 'LONG',  10, 2050.00, 2090.00, 45.00, 'closed', 8.78, 'BTC 동조, 이더 상대강도 양호', '연동 매매 성공', '{추세추종}')
RETURNING id INTO t13;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-05', '2026-03-05T07:00:00Z', '2026-03-05T12:30:00Z', 'ETH', 'SHORT', 12, 2120.00, 2080.00, 40.00, 'closed', 9.06, '저항선 도달 + 거래량 감소', '정확한 저항 매도', '{지지저항}')
RETURNING id INTO t14;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-08', '2026-03-08T14:00:00Z', '2026-03-08T19:45:00Z', 'ETH', 'LONG',  15, 2060.00, 2040.00, 35.00, 'closed', -5.10, 'BTC 약세에 이더도 하락', '상관관계 무시함', '{추세추종}')
RETURNING id INTO t15;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-11', '2026-03-11T03:30:00Z', '2026-03-11T09:00:00Z', 'ETH', 'LONG',  10, 2080.00, 2130.00, 50.00, 'closed', 12.02, '삼각수렴 상방 돌파', '패턴 신뢰도 높았음', '{돌파매매,패턴매매}')
RETURNING id INTO t16;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-15', '2026-03-15T11:00:00Z', '2026-03-15T17:30:00Z', 'ETH', 'SHORT', 10, 2150.00, 2110.00, 45.00, 'closed', 8.37, '과매수 구간, 이더 도미넌스 하락', '타이밍 적절', '{역추세}')
RETURNING id INTO t17;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-19', '2026-03-19T06:15:00Z', '2026-03-19T11:45:00Z', 'ETH', 'LONG',  20, 2070.00, 2050.00, 25.00, 'closed', -4.83, '지지선 반등 기대, 이탈함', '레버리지 과다', '{지지저항}')
RETURNING id INTO t18;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-22', '2026-03-22T09:00:00Z', '2026-03-22T15:00:00Z', 'ETH', 'LONG',  10, 2090.00, 2140.00, 50.00, 'closed', 11.96, '주봉 양봉 시작, 추세 탑승', '주봉 신호 정확', '{추세추종}')
RETURNING id INTO t19;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-27', '2026-03-27T13:30:00Z', '2026-03-27T19:00:00Z', 'ETH', 'SHORT', 12, 2160.00, 2130.00, 40.00, 'closed', 6.67, '전고점 저항 + 음봉 캔들 확인', '안정적 숏', '{지지저항,패턴매매}')
RETURNING id INTO t20;

-- SOL 거래 (6건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-03', '2026-03-03T08:00:00Z', '2026-03-03T14:30:00Z', 'SOL', 'LONG',  15, 142.50, 146.20, 35.00, 'closed', 13.61, 'SOL 생태계 TVL 증가 뉴스', '펀더멘탈 매매 성공', '{뉴스,추세추종}')
RETURNING id INTO t21;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-09', '2026-03-09T05:30:00Z', '2026-03-09T11:00:00Z', 'SOL', 'SHORT', 10, 148.00, 145.50, 40.00, 'closed', 6.76, '고점 더블탑 + 거래량 감소', '패턴 적중', '{패턴매매}')
RETURNING id INTO t22;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-13', '2026-03-13T10:15:00Z', '2026-03-13T16:00:00Z', 'SOL', 'LONG',  20, 143.80, 142.00, 25.00, 'closed', -6.26, '추세선 지지 매수, 뚫림', '과도한 레버리지', '{추세추종}')
RETURNING id INTO t23;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-16', '2026-03-16T02:00:00Z', '2026-03-16T08:30:00Z', 'SOL', 'LONG',  10, 140.50, 143.80, 45.00, 'closed', 10.57, '과매도 구간 반등 매수', 'RSI 30 이하 진입', '{반등매매,RSI}')
RETURNING id INTO t24;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-21', '2026-03-21T07:45:00Z', '2026-03-21T13:00:00Z', 'SOL', 'LONG',  15, 145.00, 147.50, 30.00, 'closed', 7.76, '삼각수렴 돌파 확인', '거래량 동반 상승', '{돌파매매}')
RETURNING id INTO t25;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-26', '2026-03-26T14:00:00Z', '2026-03-26T20:30:00Z', 'SOL', 'SHORT', 10, 149.20, 147.80, 40.00, 'closed', 3.75, '일봉 저항 + 스토캐스틱 과매수', '', '{역추세}')
RETURNING id INTO t26;

-- DOGE 거래 (4건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-04', '2026-03-04T06:00:00Z', '2026-03-04T12:30:00Z', 'DOGE', 'LONG',  25, 0.1820, 0.1870, 20.00, 'closed', 13.74, '일론 머스크 트윗 + 밈코인 상승세', '고레버 소액 베팅', '{뉴스,밈코인}')
RETURNING id INTO t27;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-11', '2026-03-11T15:00:00Z', '2026-03-11T21:00:00Z', 'DOGE', 'LONG',  20, 0.1900, 0.1870, 15.00, 'closed', -4.74, '추격 매수, 고점에서 진입', 'FOMO 매매 반성', '{밈코인}')
RETURNING id INTO t28;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-18', '2026-03-18T09:30:00Z', '2026-03-18T15:00:00Z', 'DOGE', 'SHORT', 15, 0.1950, 0.1900, 25.00, 'closed', 9.62, '급등 후 되돌림 숏', '정확한 되돌림 포착', '{역추세}')
RETURNING id INTO t29;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-25', '2026-03-25T04:30:00Z', '2026-03-25T10:00:00Z', 'DOGE', 'LONG',  10, 0.1850, 0.1890, 30.00, 'closed', 6.49, '볼린저밴드 하단 반등', '지표 신뢰도 확인', '{반등매매}')
RETURNING id INTO t30;

-- XRP 거래 (4건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-02', '2026-03-02T12:00:00Z', '2026-03-02T18:30:00Z', 'XRP', 'LONG',  10, 2.45, 2.52, 40.00, 'closed', 11.43, 'SEC 소송 호재 뉴스', '뉴스 매매 적중', '{뉴스}')
RETURNING id INTO t31;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-09', '2026-03-09T16:00:00Z', '2026-03-09T22:00:00Z', 'XRP', 'SHORT', 15, 2.58, 2.62, 25.00, 'closed', -5.81, '고점 숏 시도, 추세 지속', '손절 너무 느림', '{역추세}')
RETURNING id INTO t32;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-16', '2026-03-16T11:30:00Z', '2026-03-16T17:00:00Z', 'XRP', 'LONG',  10, 2.48, 2.55, 35.00, 'closed', 9.88, '삼각수렴 상단 돌파', '거래량 확인 후 진입', '{돌파매매}')
RETURNING id INTO t33;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-23', '2026-03-23T08:00:00Z', '2026-03-23T14:00:00Z', 'XRP', 'LONG',  12, 2.52, 2.49, 30.00, 'closed', -4.29, '지지선 반등 기대, 이탈', '손절 라인 준수', '{지지저항}')
RETURNING id INTO t34;

-- ARB 거래 (3건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-06', '2026-03-06T13:00:00Z', '2026-03-06T19:00:00Z', 'ARB', 'LONG',  20, 1.12, 1.16, 20.00, 'closed', 14.29, 'L2 업그레이드 발표', '펀더멘탈 이벤트', '{뉴스,돌파매매}')
RETURNING id INTO t35;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-14', '2026-03-14T10:00:00Z', '2026-03-14T16:30:00Z', 'ARB', 'SHORT', 15, 1.18, 1.15, 25.00, 'closed', 9.57, '급등 후 되돌림 구간', '정확한 되돌림', '{역추세}')
RETURNING id INTO t36;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-22', '2026-03-22T05:00:00Z', '2026-03-22T11:30:00Z', 'ARB', 'LONG',  10, 1.10, 1.08, 30.00, 'closed', -5.45, '하락 추세에서 역행 매수', '추세 무시한 실수', '{반등매매}')
RETURNING id INTO t37;

-- LINK 거래 (3건)
INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-07', '2026-03-07T04:00:00Z', '2026-03-07T10:30:00Z', 'LINK', 'LONG',  10, 18.50, 19.20, 40.00, 'closed', 15.14, 'CCIP 파트너십 발표', '펀더멘탈 호재', '{뉴스,추세추종}')
RETURNING id INTO t38;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-15', '2026-03-15T03:00:00Z', '2026-03-15T09:30:00Z', 'LINK', 'SHORT', 12, 19.80, 20.10, 30.00, 'closed', -5.45, '고점 숏 진입, 추세 지속', '추세 역행 반성', '{역추세}')
RETURNING id INTO t39;

INSERT INTO trades (id, user_id, date, entry_datetime, exit_datetime, asset, direction, leverage, entry_price, exit_price, margin, status, pnl, reason, notes, tags)
VALUES
  (gen_random_uuid(), uid, '2026-03-29', '2026-03-29T09:00:00Z', '2026-03-29T15:30:00Z', 'LINK', 'LONG',  15, 19.00, 19.60, 30.00, 'closed', 14.21, '4h 삼중바닥 돌파', '패턴 완성 후 진입', '{패턴매매,돌파매매}')
RETURNING id INTO t40;

-- ── 분할매수 (scale_in) 일부 거래에 추가 ──
INSERT INTO trade_scale_ins (trade_id, user_id, entry_price, margin, entry_datetime, type, note) VALUES
  (t4,  uid, 85500.00, 15.00, '2026-03-06T04:30:00Z', 'scale_in_down', 'BTC 추가 하락에 물타기'),
  (t16, uid, 2070.00,  20.00, '2026-03-11T05:00:00Z', 'scale_in_up',   'ETH 돌파 확인 후 추가 진입'),
  (t21, uid, 143.00,   15.00, '2026-03-03T10:00:00Z', 'scale_in_up',   'SOL 상승 추세 확인'),
  (t38, uid, 18.80,    15.00, '2026-03-07T06:00:00Z', 'scale_in_down', 'LINK 소폭 하락에 추가매수');

-- ── 분할청산 (trade_closes) 일부 거래에 추가 ──
-- t2: BTC SHORT (entry 88400, margin 40, lev 15)
INSERT INTO trade_closes (trade_id, user_id, exit_price, exit_datetime, quantity_pct, close_margin, pnl) VALUES
  (t2, uid, 87900.00, '2026-03-02T06:00:00Z', 50, 20.00, 1.70),
  (t2, uid, 87800.00, '2026-03-02T08:45:00Z', 50, 20.00, 2.04);

-- t6: BTC LONG (entry 88200, margin 45, lev 15)
INSERT INTO trade_closes (trade_id, user_id, exit_price, exit_datetime, quantity_pct, close_margin, pnl) VALUES
  (t6, uid, 88800.00, '2026-03-10T09:30:00Z', 60, 27.00, 4.59),
  (t6, uid, 89100.00, '2026-03-10T12:00:00Z', 40, 18.00, 2.75);

RAISE NOTICE '데모 데이터 삽입 완료: trades 40건, deposits 2건, targets 3건, scale_ins 4건, closes 4건';

END $$;
