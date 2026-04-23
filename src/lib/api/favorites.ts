/**
 * 즐겨찾기(favorites) API 레이어
 *
 * 기본/커스텀 구분 없이 심볼 단위로 즐겨찾기 상태를 관리한다.
 * `custom_assets`(거래 가능한 심볼 등록)와는 개념이 다르다.
 *
 * 원자성: 호출자는 원하는 최종 상태(`favorited: boolean`)를 전달하며,
 * 서버는 각 경로를 멱등(idempotent)으로 처리한다.
 *  - true  → `upsert ... onConflict (user_id, symbol) do nothing`
 *  - false → `delete where user_id and symbol`
 * select-then-modify 2단계가 없으므로 동시 요청 경합이 발생하지 않는다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, FavoriteRow, ApiResult } from '../supabase/types';
import { getErrorMessage } from './utils';

type Client = SupabaseClient<Database>;

const MAX_SYMBOL_LEN = 20;

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/**
 * 사용자의 즐겨찾기 심볼 목록을 반환한다.
 */
export async function getFavorites(
  supabase: Client,
  userId: string,
): Promise<ApiResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('symbol')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    const symbols = (data ?? []).map((row) => row.symbol as string);
    return { success: true, data: symbols };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 심볼의 즐겨찾기 상태를 원하는 값으로 설정한다 (멱등).
 * - `favorited: true`  → `(user_id, symbol)` UNIQUE 제약을 이용한 idempotent insert
 * - `favorited: false` → idempotent delete
 */
export async function setFavorite(
  supabase: Client,
  userId: string,
  rawSymbol: string,
  favorited: boolean,
): Promise<ApiResult<{ favorited: boolean }>> {
  try {
    const symbol = normalizeSymbol(rawSymbol);
    if (!symbol) return { success: false, error: '심볼을 입력해주세요.' };
    if (symbol.length > MAX_SYMBOL_LEN) {
      return { success: false, error: `심볼은 최대 ${MAX_SYMBOL_LEN}자입니다.` };
    }

    if (favorited) {
      const { error } = await supabase
        .from('favorites')
        .upsert(
          { user_id: userId, symbol },
          { onConflict: 'user_id,symbol', ignoreDuplicates: true },
        );
      if (error) return { success: false, error: error.message };
      return { success: true, data: { favorited: true } };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol);
    if (error) return { success: false, error: error.message };
    return { success: true, data: { favorited: false } };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export type { FavoriteRow };
