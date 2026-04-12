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

// ── 감정 태그 ──
export const EMOTIONS = [
  { id: 'calm', label: '침착', color: 'text-info', bgColor: 'bg-info-soft' },
  { id: 'confident', label: '확신', color: 'text-profit', bgColor: 'bg-profit-bg' },
  { id: 'fomo', label: 'FOMO', color: 'text-warning', bgColor: 'bg-warning-bg' },
  { id: 'revenge', label: '복수매매', color: 'text-loss', bgColor: 'bg-loss-bg' },
  { id: 'anxious', label: '불안', color: 'text-anxious', bgColor: 'bg-anxious-bg' },
] as const

// ── 목표 색상 팔레트 ──
export const TARGET_COLORS = [
  '#18794e', '#1c6ef3', '#7c3aed', '#c2410c', '#0e7490',
] as const
