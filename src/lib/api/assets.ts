/**
 * 코인 목록(Assets) API 레이어
 *
 * 기본 제공 코인 + 사용자 커스텀 코인 관리를 담당한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  CustomAssetRow,
  ApiResult,
} from '../supabase/types';

type Client = SupabaseClient<Database>;

/** 기본 제공 코인 목록 (12종) */
export const DEFAULT_ASSETS = [
  'BTC',
  'ETH',
  'SOL',
  'XRP',
  'ADA',
  'DOGE',
  'AVAX',
  'BNB',
  'MATIC',
  'LINK',
  'OP',
  'ARB',
] as const;

export type DefaultAsset = (typeof DEFAULT_ASSETS)[number];

/**
 * 사용자의 커스텀 코인 목록을 조회한다.
 */
export async function getCustomAssets(
  supabase: Client,
  userId: string
): Promise<ApiResult<CustomAssetRow[]>> {
  try {
    const { data, error } = await supabase
      .from('custom_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as CustomAssetRow[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 기본 코인 + 커스텀 코인을 합친 전체 목록을 반환한다.
 * 거래 입력 폼의 코인 선택 드롭다운에 사용된다.
 */
export async function getAllAssets(
  supabase: Client,
  userId: string
): Promise<ApiResult<string[]>> {
  try {
    const result = await getCustomAssets(supabase, userId);

    if (!result.success) {
      return result;
    }

    const customSymbols = result.data.map((row) => row.symbol);
    // 기본 코인 + 커스텀 코인, 중복 제거
    const allAssets = [
      ...DEFAULT_ASSETS,
      ...customSymbols.filter(
        (s) => !DEFAULT_ASSETS.includes(s as DefaultAsset)
      ),
    ];

    return { success: true, data: allAssets };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 커스텀 코인을 추가한다.
 * 심볼은 자동으로 대문자로 변환된다.
 */
export async function addCustomAsset(
  supabase: Client,
  userId: string,
  symbol: string
): Promise<ApiResult<CustomAssetRow>> {
  try {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return { success: false, error: '코인 심볼을 입력해주세요.' };
    }

    // 기본 코인 목록에 이미 존재하는지 확인
    if (DEFAULT_ASSETS.includes(normalizedSymbol as DefaultAsset)) {
      return {
        success: false,
        error: `${normalizedSymbol}은(는) 기본 제공 코인입니다.`,
      };
    }

    const { data, error } = await supabase
      .from('custom_assets')
      .insert({
        user_id: userId,
        symbol: normalizedSymbol,
      })
      .select()
      .single();

    if (error) {
      // unique 제약 조건 위반 (중복 코인)
      if (error.code === '23505') {
        return {
          success: false,
          error: `${normalizedSymbol}은(는) 이미 추가된 코인입니다.`,
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CustomAssetRow };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 커스텀 코인을 삭제한다.
 */
export async function deleteCustomAsset(
  supabase: Client,
  assetId: string
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('custom_assets')
      .delete()
      .eq('id', assetId);

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

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다.';
}
