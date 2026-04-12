/** AI 리포트 전용 타입 정의 */

/** AI 리포트 종합 데이터 */
export interface AIReportData {
  headline: string
  masterScore: number
  masterScoreGrade: 'great' | 'good' | 'average' | 'watch'
  behavioralPatterns: BehavioralPattern[]
  emotionWinRates: EmotionWinRate[]
  timeHeatmap: TimeHeatmapCell[]
  recommendations: AIRecommendation[]
  kpis: AIReportKPIs
  radarData: RadarDataPoint[]
}

export interface BehavioralPattern {
  id: string
  severity: 'critical' | 'caution' | 'positive'
  title: string
  description: string
  tag: string
}

export interface EmotionWinRate {
  emotion: string
  label: string
  winRate: number
  totalTrades: number
  avgPnl: number
}

export interface TimeHeatmapCell {
  dayOfWeek: number
  hourSlot: number
  totalPnl: number
  tradeCount: number
}

export interface AIRecommendation {
  number: number
  title: string
  description: string
  impact: 'high' | 'medium'
}

export interface AIReportKPIs {
  profitFactor: number
  maxDrawdown: number
  avgHoldTime: string
  winRate: number
  sharpeRatio: number
}

export interface RadarDataPoint {
  axis: string
  value: number
  fullMark: number
}
