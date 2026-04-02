/**
 * 월간 AI 리포트 API 레이어
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, MonthlyReportRow, ApiResult } from '../supabase/types';

type Client = SupabaseClient<Database>;

/**
 * 월간 리포트 목록을 조회한다 (최신순).
 */
export async function getReports(
  supabase: Client,
  userId: string,
): Promise<ApiResult<MonthlyReportRow[]>> {
  try {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as MonthlyReportRow[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

/**
 * 특정 리포트를 ID로 조회한다.
 */
export async function getReportById(
  supabase: Client,
  reportId: string,
): Promise<ApiResult<MonthlyReportRow>> {
  try {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as MonthlyReportRow };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}
