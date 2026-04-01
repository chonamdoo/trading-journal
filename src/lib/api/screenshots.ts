/**
 * 스크린샷 API 레이어
 *
 * Supabase Storage(trade-screenshots 버킷) + trade_screenshots 테이블을 사용한다.
 * 퍼블릭 버킷이므로 CDN URL을 직접 사용한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TradeScreenshotRow, ApiResult } from '../supabase/types';

type Client = SupabaseClient<Database>;

const BUCKET = 'trade-screenshots';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/** 스토리지 경로에서 퍼블릭 CDN URL을 생성한다 */
function getPublicUrl(supabase: Client, path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** 파일을 업로드하고 DB에 메타데이터를 저장한다 */
export async function uploadScreenshot(
  supabase: Client,
  file: File,
  userId: string,
  tradeId: string,
  sortOrder: number,
): Promise<ApiResult<TradeScreenshotRow & { url: string }>> {
  // 유효성 검사
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `파일 크기가 5MB를 초과합니다: ${file.name}` };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: `지원하지 않는 파일 형식입니다: ${file.name}` };
  }

  // 고유 파일명 생성
  const ext = file.name.split('.').pop() || 'png';
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${userId}/${tradeId}/${uniqueName}`;

  // Storage 업로드
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1년 CDN 캐시
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: `업로드 실패: ${uploadError.message}` };
  }

  // DB에 메타데이터 저장
  const { data, error: dbError } = await supabase
    .from('trade_screenshots')
    .insert({
      trade_id: tradeId,
      user_id: userId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (dbError || !data) {
    // DB 실패 시 업로드된 파일도 삭제
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { success: false, error: `메타데이터 저장 실패: ${dbError?.message}` };
  }

  return {
    success: true,
    data: { ...data, url: getPublicUrl(supabase, storagePath) },
  };
}

/** 거래의 모든 스크린샷을 조회한다 */
export async function getScreenshots(
  supabase: Client,
  tradeId: string,
): Promise<ApiResult<(TradeScreenshotRow & { url: string })[]>> {
  const { data, error } = await supabase
    .from('trade_screenshots')
    .select('*')
    .eq('trade_id', tradeId)
    .order('sort_order', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const withUrls = (data || []).map((row) => ({
    ...row,
    url: getPublicUrl(supabase, row.storage_path),
  }));

  return { success: true, data: withUrls };
}

/** 여러 거래의 스크린샷을 한번에 조회한다 */
export async function getScreenshotsByTradeIds(
  supabase: Client,
  tradeIds: string[],
): Promise<ApiResult<(TradeScreenshotRow & { url: string })[]>> {
  if (tradeIds.length === 0) return { success: true, data: [] };

  const { data, error } = await supabase
    .from('trade_screenshots')
    .select('*')
    .in('trade_id', tradeIds)
    .order('sort_order', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const withUrls = (data || []).map((row) => ({
    ...row,
    url: getPublicUrl(supabase, row.storage_path),
  }));

  return { success: true, data: withUrls };
}

/** 스크린샷을 삭제한다 (Storage + DB) */
export async function deleteScreenshot(
  supabase: Client,
  screenshotId: string,
  storagePath: string,
): Promise<ApiResult<null>> {
  // Storage에서 삭제
  await supabase.storage.from(BUCKET).remove([storagePath]);

  // DB에서 삭제
  const { error } = await supabase
    .from('trade_screenshots')
    .delete()
    .eq('id', screenshotId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

/** 거래의 모든 스크린샷을 삭제한다 (거래 삭제 시) */
export async function deleteScreenshotsByTradeId(
  supabase: Client,
  userId: string,
  tradeId: string,
): Promise<void> {
  // Storage 폴더 내 파일 목록 조회 후 삭제
  const folder = `${userId}/${tradeId}`;
  const { data: files } = await supabase.storage.from(BUCKET).list(folder);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${folder}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
  // DB 행은 ON DELETE CASCADE로 자동 삭제됨
}
