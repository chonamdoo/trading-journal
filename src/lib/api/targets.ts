/**
 * 목표(Targets) API 레이어
 *
 * 목표 자산 금액의 CRUD를 담당한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  TargetRow,
  TargetInsert,
  TargetUpdate,
  ApiResult,
} from '../supabase/types';

type Client = SupabaseClient<Database>;

/**
 * 사용자의 전체 목표 목록을 정렬순서대로 조회한다.
 */
export async function getTargets(
  supabase: Client,
  userId: string
): Promise<ApiResult<TargetRow[]>> {
  try {
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as TargetRow[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 새로운 목표를 추가한다.
 * sort_order는 기존 최대값 + 1로 자동 설정된다.
 */
export async function createTarget(
  supabase: Client,
  userId: string,
  label: string,
  amount: number
): Promise<ApiResult<TargetRow>> {
  try {
    // 현재 최대 sort_order 조회
    const { data: existing } = await supabase
      .from('targets')
      .select('sort_order')
      .eq('user_id', userId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const insert: TargetInsert = {
      user_id: userId,
      label,
      amount,
      sort_order: nextOrder,
    };

    const { data, error } = await supabase
      .from('targets')
      .insert(insert)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as TargetRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 목표를 수정한다.
 */
export async function updateTarget(
  supabase: Client,
  targetId: string,
  updates: TargetUpdate
): Promise<ApiResult<TargetRow>> {
  try {
    const { data, error } = await supabase
      .from('targets')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as TargetRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 목표를 삭제한다.
 */
export async function deleteTarget(
  supabase: Client,
  targetId: string
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', targetId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 목표 순서를 재정렬한다.
 * targetIds 배열의 순서대로 sort_order를 업데이트한다.
 */
export async function reorderTargets(
  supabase: Client,
  targetIds: string[]
): Promise<ApiResult<void>> {
  try {
    // 각 목표의 sort_order를 배열 인덱스로 업데이트
    const updates = targetIds.map((id, index) =>
      supabase
        .from('targets')
        .update({ sort_order: index })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
      return { success: false, error: failed.error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다.';
}
