/**
 * 프로필(Profile) API 레이어
 *
 * 사용자 프로필 조회 및 수정을 담당한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  ProfileRow,
  ProfileUpdate,
  ApiResult,
} from '../supabase/types';

type Client = SupabaseClient<Database>;

/**
 * 현재 로그인한 사용자의 프로필을 조회한다.
 */
export async function getProfile(
  supabase: Client,
  userId: string
): Promise<ApiResult<ProfileRow>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ProfileRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 프로필을 수정한다.
 */
export async function updateProfile(
  supabase: Client,
  userId: string,
  updates: ProfileUpdate
): Promise<ApiResult<ProfileRow>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ProfileRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 초기 자산(시드 머니)을 설정한다.
 * 온보딩 단계에서 사용된다.
 */
export async function setInitialCapital(
  supabase: Client,
  userId: string,
  amount: number
): Promise<ApiResult<ProfileRow>> {
  if (amount < 0) {
    return { success: false, error: '초기 자산은 0 이상이어야 합니다.' };
  }

  return updateProfile(supabase, userId, { initial_capital: amount });
}

/**
 * 사용자의 현재 총 자산을 계산한다.
 * 총자산 = 초기자산 + 추가입금합계 + 거래손익합계
 */
export async function calculateTotalAsset(
  supabase: Client,
  userId: string
): Promise<ApiResult<{
  totalAsset: number;
  initialCapital: number;
  totalDeposits: number;
  totalPnl: number;
}>> {
  try {
    // 프로필 조회 (초기 자산)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('initial_capital')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // 입금 합계 조회
    const { data: deposits, error: depositError } = await supabase
      .from('deposits')
      .select('amount')
      .eq('user_id', userId);

    if (depositError) {
      return { success: false, error: depositError.message };
    }

    // 거래 손익 합계 조회 (종료된 거래만)
    const { data: trades, error: tradeError } = await supabase
      .from('trades')
      .select('pnl')
      .eq('user_id', userId)
      .eq('status', 'closed');

    if (tradeError) {
      return { success: false, error: tradeError.message };
    }

    const initialCapital = Number(profile.initial_capital);
    const totalDeposits = (deposits ?? []).reduce(
      (sum, d) => sum + Number(d.amount),
      0
    );
    const totalPnl = (trades ?? []).reduce(
      (sum, t) => sum + Number(t.pnl ?? 0),
      0
    );
    const totalAsset = initialCapital + totalDeposits + totalPnl;

    return {
      success: true,
      data: {
        totalAsset: Math.round(totalAsset * 100) / 100,
        initialCapital,
        totalDeposits: Math.round(totalDeposits * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100,
      },
    };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 프로필을 삭제한다 (계정 탈퇴).
 * CASCADE로 모든 관련 데이터(trades, deposits, targets, custom_assets)가 함께 삭제된다.
 *
 * 주의: 프론트엔드에서 반드시 이중 확인(더블 컨펌)을 받은 후 호출해야 한다.
 */
export async function deleteProfile(
  supabase: Client,
  userId: string
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 사용자의 온보딩 완료 여부를 확인한다.
 * initial_capital이 0보다 크면 온보딩 완료로 판단한다.
 */
export async function isOnboardingComplete(
  supabase: Client,
  userId: string
): Promise<ApiResult<boolean>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('initial_capital')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: Number(data.initial_capital) > 0 };
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
