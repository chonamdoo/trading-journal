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
import { getErrorMessage } from './utils';

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

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────
