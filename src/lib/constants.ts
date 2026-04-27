// ── 기본 코인 목록 (바이낸스·바이비트·OKX 선물 종목 합산, 2026-04 기준) ──
export const DEFAULT_ASSETS = [
  '0G', '1000000BABYDOGE', '1000000BOB', '1000000CHEEMS', '1000000MOG', '10000QUBIC', '10000SATS',
  '1000BONK', '1000BTT', '1000CAT', '1000CHEEMS', '1000FLOKI', '1000LUNC', '1000NEIROCTO',
  '1000PEPE', '1000RATS', '1000SATS', '1000SHIB', '1000TAG', '1000TOSHI', '1000TURBO', '1000XEC',
  '1INCH', '1MBABYDOGE', '2Z', '4', 'A', 'AAVE', 'ACE', 'ACH', 'ACT', 'ACU', 'ACX', 'ADA',
  'AERGO', 'AERO', 'AEVO', 'AGI', 'AGLD', 'AGT', 'AI', 'AIA', 'AIN', 'AIO', 'AIOT', 'AIOZ',
  'AIXBT', 'AKE', 'AKT', 'ALCH', 'ALGO', 'ALICE', 'ALL', 'ALLO', 'ALPINE', 'ALT', 'ANIME',
  'ANKR', 'APE', 'APEX', 'API3', 'APR', 'APT', 'AR', 'ARB', 'ARC', 'ARIA', 'ARK', 'ARKM',
  'ARPA', 'ASP', 'ASR', 'ASTER', 'ASTR', 'AT', 'ATA', 'ATH', 'ATOM', 'AUCTION', 'AVA', 'AVAAI',
  'AVAX', 'AVNT', 'AWE', 'AXL', 'AXS', 'AZTEC', 'B', 'B2', 'B3', 'BABY', 'BAN', 'BANANA',
  'BANANAS31', 'BAND', 'BANK', 'BARD', 'BAS', 'BASED', 'BAT', 'BB', 'BCH', 'BEAM', 'BEAMX',
  'BEAT', 'BEL', 'BERA', 'BICO', 'BIGTIME', 'BIO', 'BIRB', 'BLAST', 'BLESS', 'BLUAI', 'BLUR',
  'BMT', 'BNB', 'BNT', 'BOB', 'BOBA', 'BOBBOB', 'BOME', 'BONK', 'BR', 'BRETT', 'BREV',
  'BROCCOLI', 'BROCCOLI714', 'BROCCOLIF3B', 'BSB', 'BSU', 'BSV', 'BTC', 'BTR', 'BULLA', 'C',
  'C98', 'CAKE', 'CAMP', 'CARV', 'CATI', 'CC', 'CELO', 'CELR', 'CETUS', 'CFG', 'CFX', 'CGPT',
  'CHILLGUY', 'CHR', 'CHZ', 'CKB', 'CLANKER', 'CLO', 'CLOUD', 'COAI', 'COLLECT', 'COMP',
  'COOKIE', 'CORE', 'COS', 'COTI', 'COW', 'CRCL', 'CRO', 'CROSS', 'CRV', 'CTC', 'CTK', 'CTSI',
  'CVC', 'CVX', 'CYBER', 'CYS', 'D', 'DAM', 'DASH', 'DBR', 'DEEP', 'DEGEN', 'DEGO', 'DENT',
  'DEXE', 'DIA', 'DODOX', 'DOG', 'DOGE', 'DOGS', 'DOLO', 'DOOD', 'DOT', 'DRIFT', 'DUSK',
  'DYDX', 'DYM', 'EDEN', 'EDGE', 'EDU', 'EGLD', 'EIGEN', 'ELSA', 'ENA', 'ENJ', 'ENS', 'ENSO',
  'EPIC', 'ERA', 'ES', 'ESP', 'ESPORTS', 'ETC', 'ETH', 'ETHFI', 'ETHW', 'EUL', 'EVAA', 'F',
  'FARTCOIN', 'FET', 'FF', 'FHE', 'FIDA', 'FIGHT', 'FIL', 'FIO', 'FLOCK', 'FLOKI', 'FLOW',
  'FLR', 'FLUID', 'FLUX', 'FOGO', 'FOLKS', 'FORM', 'FRAX', 'FUN', 'G', 'GALA', 'GAS', 'GIGA',
  'GIGGLE', 'GLM', 'GMT', 'GMX', 'GNO', 'GOAT', 'GODS', 'GPS', 'GRASS', 'GRIFFAIN', 'GRT',
  'GTC', 'GUA', 'GUN', 'GWEI', 'H', 'HAEDAL', 'HANA', 'HBAR', 'HEI', 'HEMI', 'HFT', 'HIGH',
  'HIPPO', 'HIVE', 'HMSTR', 'HNT', 'HOLO', 'HOME', 'HOOK', 'HOT', 'HPOS10I', 'HUMA', 'HYPE',
  'HYPER', 'ICNT', 'ICP', 'ICX', 'ID', 'IDOL', 'ILV', 'IMX', 'IN', 'INIT', 'INJ', 'INX', 'IO',
  'IOST', 'IOTA', 'IOTX', 'IP', 'IR', 'IRYS', 'JASMY', 'JCT', 'JELLYJELLY', 'JOE', 'JST',
  'JTO', 'JUP', 'KAIA', 'KAITO', 'KAS', 'KAT', 'KAVA', 'KERNEL', 'KGEN', 'KITE', 'KMNO', 'KNC',
  'KOMA', 'KSM', 'L3', 'LA', 'LAB', 'LAYER', 'LDO', 'LIGHT', 'LINEA', 'LINK', 'LISTA', 'LIT',
  'LPT', 'LQTY', 'LRC', 'LSK', 'LTC', 'LUMIA', 'LUNA', 'LUNA2', 'LYN', 'M', 'MAGIC', 'MAGMA',
  'MANA', 'MANTA', 'MANTRA', 'MASK', 'MAV', 'MAVIA', 'MBOX', 'ME', 'MEGA', 'MELANIA', 'MEME',
  'MERL', 'MET', 'METIS', 'MEW', 'MINA', 'MIRA', 'MITO', 'MLN', 'MMT', 'MNT', 'MOCA', 'MON',
  'MOODENG', 'MORPHO', 'MOVE', 'MOVR', 'MTL', 'MUBARAK', 'MYX', 'NAORIS', 'NEAR', 'NEIRO',
  'NEO', 'NEWT', 'NFP', 'NIGHT', 'NIL', 'NMR', 'NOM', 'NOT', 'NTRN', 'NXPC', 'OG', 'OGN',
  'OKB', 'OL', 'ON', 'ONDO', 'ONE', 'ONG', 'ONT', 'OP', 'OPEN', 'OPN', 'ORBS', 'ORCA', 'ORDER',
  'ORDI', 'OXT', 'PARTI', 'PEAQ', 'PENDLE', 'PENGU', 'PEOPLE', 'PEPE', 'PHA', 'PHB', 'PI',
  'PIEVERSE', 'PIPPIN', 'PIXEL', 'PLAY', 'PLAYSOUT', 'PLUME', 'PNUT', 'POL', 'POLYX', 'PONKE',
  'POPCAT', 'PORTAL', 'POWER', 'POWR', 'PRL', 'PROM', 'PROMPT', 'PROVE', 'PTB', 'PUFFER', 'PUMP',
  'PUMPBTC', 'PUMPFUN', 'PUNDIX', 'PYR', 'PYTH', 'Q', 'QNT', 'QTUM', 'RARE', 'RAVE', 'RAY',
  'RAYDIUM', 'RAYSOL', 'RDNT', 'RECALL', 'RED', 'RENDER', 'REQ', 'RESOLV', 'REZ', 'RIF', 'RIVER',
  'RLC', 'RLS', 'ROAM', 'ROBO', 'RONIN', 'ROSE', 'RPL', 'RSR', 'RUNE', 'RVN', 'S', 'SAFE',
  'SAGA', 'SAHARA', 'SAND', 'SANTOS', 'SAPIEN', 'SATS', 'SC', 'SCR', 'SCRT', 'SEI', 'SENT',
  'SFP', 'SHELL', 'SHIB', 'SHIB1000', 'SIGN', 'SIREN', 'SKL', 'SKR', 'SKY', 'SKYAI', 'SLP',
  'SNT', 'SNX', 'SOL', 'SOLAYER', 'SOLV', 'SOMI', 'SONIC', 'SOON', 'SOPH', 'SOSO', 'SPACE',
  'SPELL', 'SPK', 'SPORTFUN', 'SPX', 'SQD', 'SSV', 'STABLE', 'STBL', 'STEEM', 'STG', 'STO',
  'STORJ', 'STRK', 'STX', 'SUI', 'SUN', 'SUPER', 'SUSHI', 'SWARMS', 'SXP', 'SXT', 'SYN',
  'SYRUP', 'SYS', 'T', 'TA', 'TAC', 'TAG', 'TAIKO', 'TAKE', 'TAO', 'THE', 'THETA', 'TIA', 'TLM',
  'TNSR', 'TON', 'TOSHI', 'TOWNS', 'TRADOOR', 'TRB', 'TREE', 'TRIA', 'TRU', 'TRUMP', 'TRUST',
  'TRUTH', 'TRX', 'TST', 'TSTBSC', 'TURBO', 'TURTLE', 'TUT', 'TWT', 'UAI', 'UB', 'UMA', 'UNI',
  'US', 'USELESS', 'USUAL', 'VANA', 'VANRY', 'VELO', 'VELODROME', 'VELVET', 'VET', 'VIC', 'VINE',
  'VIRTUAL', 'VTHO', 'VVV', 'W', 'WAL', 'WAVES', 'WAXP', 'WCT', 'WET', 'WHITEWHALE', 'WIF',
  'WLD', 'WLFI', 'WOO', 'XAI', 'XAN', 'XCN', 'XDC', 'XION', 'XLM', 'XMR', 'XNY', 'XPIN',
  'XPL', 'XRP', 'XTZ', 'XVG', 'XVS', 'YB', 'YFI', 'YGG', 'YZY', 'ZAMA', 'ZBCN', 'ZBT', 'ZEC',
  'ZEN', 'ZEREBRO', 'ZETA', 'ZIL', 'ZK', 'ZKC', 'ZKJ', 'ZKP', 'ZORA', 'ZRO', 'ZRX',
] as const

// ── 환율 (고정, P2에서 실시간 연동 예정) ──
export const USDT_KRW_RATE = 1370

// ── 레버리지 범위 ──
export const LEVERAGE_MIN = 1
export const LEVERAGE_MAX = 125
export const LEVERAGE_DEFAULT = 10

// ── 네비게이션 탭 ──
export const NAV_TABS = [
  { id: 'dashboard', label: '대시보드', href: '/' },
  { id: 'entry', label: '거래 입력', href: '/trades/new' },
  { id: 'history', label: '거래 내역', href: '/trades' },
  { id: 'analysis', label: '분석', href: '/analysis' },
  { id: 'settings', label: '설정', href: '/settings' },
] as const

// ── 복기 태그: AI 비용 없이 규칙 기반 분석/리포트에 쓰는 행동 중심 태그 ──
export const REVIEW_TAGS = [
  { id: 'plan_followed', label: '계획준수', group: 'good' },
  { id: 'clear_reason', label: '근거명확', group: 'good' },
  { id: 'good_waiting', label: '좋은대기', group: 'good' },
  { id: 'weak_reason', label: '근거부족', group: 'risk' },
  { id: 'impulsive', label: '뇌동매매', group: 'risk' },
  { id: 'fomo', label: 'FOMO', group: 'risk' },
  { id: 'revenge', label: '복수매매', group: 'risk' },
  { id: 'over_reentry', label: '재진입과다', group: 'risk' },
  { id: 'late_stop', label: '손절지연', group: 'risk' },
  { id: 'early_take_profit', label: '익절빠름', group: 'risk' },
  { id: 'late_take_profit', label: '익절지연', group: 'risk' },
  { id: 'oversized', label: '사이즈과다', group: 'risk' },
  { id: 'breakout', label: '돌파', group: 'setup' },
  { id: 'support_rebound', label: '지지반등', group: 'setup' },
  { id: 'pullback', label: '눌림목', group: 'setup' },
  { id: 'trend_follow', label: '추세추종', group: 'setup' },
  { id: 'counter_trend', label: '역추세', group: 'setup' },
  { id: 'news', label: '뉴스/이슈', group: 'setup' },
] as const

export const REVIEW_CHOICES = [
  {
    id: 'planned',
    label: '계획된 진입',
    tags: ['plan_followed', 'clear_reason'],
    reason: '진입 전 계획과 근거를 바탕으로 실행한 매매입니다.',
    notes: '계획과 실제 실행이 일치했는지 확인했습니다. 다음에도 같은 조건에서만 반복할 가치가 있습니다.',
  },
  {
    id: 'support_resistance',
    label: '지지/저항 근거',
    tags: ['clear_reason', 'support_rebound'],
    reason: '지지/저항 구간 반응을 근거로 진입한 매매입니다.',
    notes: '해당 구간 반응이 계획한 기준에 맞았는지, 손절 기준을 지켰는지 확인이 필요합니다.',
  },
  {
    id: 'breakout_trend',
    label: '돌파/추세 근거',
    tags: ['clear_reason', 'breakout', 'trend_follow'],
    reason: '돌파 또는 추세 지속을 근거로 진입한 매매입니다.',
    notes: '돌파 실패 시 대응 기준과 청산 타이밍이 계획에 맞았는지 확인이 필요합니다.',
  },
  {
    id: 'impulsive',
    label: '충동 진입',
    tags: ['impulsive', 'weak_reason'],
    reason: '명확한 사전 계획보다 즉흥적인 판단이 앞선 진입입니다.',
    notes: '진입 전 확인 기준이 부족했습니다. 다음 거래 전 최소 1개 이상의 근거와 손절 기준을 확인해야 합니다.',
  },
  {
    id: 'revenge',
    label: '손실 복구 시도',
    tags: ['revenge', 'over_reentry', 'impulsive'],
    reason: '직전 손실을 만회하려는 재진입 성격이 섞인 매매입니다.',
    notes: '손실 이후 같은 방향 재진입이 반복되면 손실이 커질 수 있습니다. 다음에는 손실 후 재진입 횟수를 제한해야 합니다.',
  },
  {
    id: 'unclear',
    label: '아직 모름',
    tags: ['weak_reason'],
    reason: '진입 근거를 아직 명확히 정리하지 못한 매매입니다.',
    notes: '확정 전 차트 근거, 손절 기준, 청산 판단을 다시 확인해야 합니다.',
  },
] as const

// ── 목표 색상 팔레트 ──
export const TARGET_COLORS = [
  '#18794e', '#1c6ef3', '#7c3aed', '#c2410c', '#0e7490',
] as const
