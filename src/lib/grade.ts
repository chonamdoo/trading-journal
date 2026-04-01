/**
 * 등급 시스템 유틸리티 (UI용)
 * - 0~100 점수를 4단계 등급으로 변환
 * - 등급 라벨 및 색상 관련 유틸
 *
 * 계산 로직(보간, 가중치 등)은 calc.ts에 정의되어 있다.
 */

/** 등급 타입 (UI용 소문자) */
export type Grade = 'great' | 'good' | 'average' | 'watch'

/** 점수 -> 등급 변환 */
export function getGrade(score: number): Grade {
  if (score >= 80) return 'great'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'watch'
}

/** 등급 라벨 */
export function getGradeLabel(grade: Grade): string {
  const labels: Record<Grade, string> = {
    great: 'GREAT',
    good: 'GOOD',
    average: 'AVERAGE',
    watch: 'WATCH OUT',
  }
  return labels[grade]
}

/** ScoreGrade(types) -> Grade(UI) 변환 */
export function scoreGradeToGrade(sg: 'GREAT' | 'GOOD' | 'AVERAGE' | 'WATCH_OUT'): Grade {
  const map: Record<string, Grade> = {
    GREAT: 'great',
    GOOD: 'good',
    AVERAGE: 'average',
    WATCH_OUT: 'watch',
  }
  return map[sg] ?? 'watch'
}

/** 등급별 CSS 텍스트 색상 클래스 */
export function getGradeColorClass(grade: Grade): string {
  const map: Record<Grade, string> = {
    great: 'text-grade-great',
    good: 'text-grade-good',
    average: 'text-grade-average',
    watch: 'text-grade-watch',
  }
  return map[grade]
}
