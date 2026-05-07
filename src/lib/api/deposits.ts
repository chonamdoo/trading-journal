/**
 * 입출금(Deposits) API 레이어
 *
 * 입출금 기록의 CRUD를 담당한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  DepositRow,
  DepositInsert,
  DepositUpdate,
  ApiResult,
} from '../supabase/types';
import { getErrorMessage } from './utils';

type Client = SupabaseClient<Database>;

/**
 * 사용자의 전체 입출금 목록을 조회한다.
 */
export async function getDeposits(
  supabase: Client,
  userId: string
): Promise<ApiResult<DepositRow[]>> {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as DepositRow[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 입금 합계를 조회한다.
 */
export async function getDepositTotal(
  supabase: Client,
  userId: string
): Promise<ApiResult<number>> {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('amount')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    const total = (data ?? []).reduce(
      (sum, row) => sum + Number(row.amount),
      0
    );
    return { success: true, data: total };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 새로운 입금을 추가한다.
 */
export async function createDeposit(
  supabase: Client,
  deposit: DepositInsert
): Promise<ApiResult<DepositRow>> {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .insert(deposit)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as DepositRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 입금 기록을 수정한다.
 */
export async function updateDeposit(
  supabase: Client,
  depositId: string,
  updates: DepositUpdate
): Promise<ApiResult<DepositRow>> {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .update(updates)
      .eq('id', depositId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as DepositRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 입금 기록을 삭제한다.
 */
export async function deleteDeposit(
  supabase: Client,
  depositId: string
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('deposits')
      .delete()
      .eq('id', depositId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────
