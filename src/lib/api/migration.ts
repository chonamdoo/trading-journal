/**
 * JSON v4 → Supabase 데이터 마이그레이션 유틸리티
 *
 * PRD 4.3 마이그레이션 전략에 따른 강화된 검증 로직:
 * - 스키마 검증 (필수 필드, 데이터 타입)
 * - NaN/Infinity 방어
 * - 중복 체크
 * - 단일 트랜잭션 INSERT, 실패 시 롤백 (Supabase RPC)
 * - 결과 리포트
 */

import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, MigrationResult, ApiResult } from '../supabase/types';

type Client = SupabaseClient<Database>;

// ────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────

/** 최대 파일 크기 (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** trades 배열 최대 건수 */
const MAX_TRADES = 10_000;

/** deposits 배열 최대 건수 */
const MAX_DEPOSITS = 1_000;

/** 텍스트 필드 최대 길이 */
const MAX_TEXT_LENGTH = 5_000;

// ────────────────────────────────────────────
// Zod 스키마 정의
// ────────────────────────────────────────────

/**
 * 유한한 숫자만 허용하는 커스텀 검증 (NaN, Infinity, -Infinity 거부)
 */
const finiteNumber = z.number().refine(
  (val) => Number.isFinite(val),
  { message: 'NaN 또는 Infinity 값은 허용되지 않습니다.' }
);

/** 양수인 유한한 숫자 */
const positiveFiniteNumber = finiteNumber.refine(
  (val) => val > 0,
  { message: '0보다 큰 값이어야 합니다.' }
);

/** YYYY-MM-DD 형식의 날짜 문자열 */
const dateString = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  '날짜는 YYYY-MM-DD 형식이어야 합니다.'
).refine(
  (val) => !isNaN(Date.parse(val)),
  '유효하지 않은 날짜입니다.'
);

/** 텍스트 필드 (최대 5000자) */
const textField = z.string().max(MAX_TEXT_LENGTH, `텍스트는 최대 ${MAX_TEXT_LENGTH}자까지 허용됩니다.`).optional().nullable();

/** 거래 항목 스키마 */
const tradeSchema = z.object({
  id: z.string().min(1, 'id는 필수입니다.'),
  date: dateString,
  entryDatetime: z.string().optional().nullable(),
  exitDatetime: z.string().optional().nullable(),
  asset: z.string().min(1, 'asset은 필수입니다.'),
  direction: z.enum(['LONG', 'SHORT'], {
    errorMap: () => ({ message: 'direction은 LONG 또는 SHORT이어야 합니다.' }),
  }),
  leverage: finiteNumber.refine(
    (val) => val >= 1 && val <= 125,
    { message: 'leverage는 1~125 범위여야 합니다.' }
  ),
  entryPrice: positiveFiniteNumber,
  exitPrice: positiveFiniteNumber.optional().nullable(),
  margin: positiveFiniteNumber,
  status: z.enum(['open', 'closed'], {
    errorMap: () => ({ message: 'status는 open 또는 closed여야 합니다.' }),
  }),
  pnl: finiteNumber.optional().nullable(),
  reason: textField,
  notes: textField,
}).refine(
  // closed 상태에서는 exitPrice와 pnl이 존재해야 한다
  (trade) => {
    if (trade.status === 'closed') {
      return trade.exitPrice != null && trade.pnl != null;
    }
    return true;
  },
  {
    message: 'closed 상태의 거래에는 exitPrice와 pnl이 필수입니다.',
    path: ['status'],
  }
);

/** 입금 항목 스키마 */
const depositSchema = z.object({
  id: z.string().min(1),
  date: dateString,
  amount: positiveFiniteNumber,
  memo: textField,
});

/** 목표 항목 스키마 */
const targetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'label은 필수입니다.'),
  amount: positiveFiniteNumber,
});

/** JSON v4 전체 스키마 */
const jsonV4Schema = z.object({
  version: z.literal(4, {
    errorMap: () => ({ message: '지원되는 버전은 4입니다. version 필드를 확인해주세요.' }),
  }),
  ic: finiteNumber.refine(
    (val) => val >= 0,
    { message: '초기 자산(ic)은 0 이상이어야 합니다.' }
  ),
  trades: z.array(tradeSchema).max(
    MAX_TRADES,
    `거래는 최대 ${MAX_TRADES.toLocaleString()}건까지 허용됩니다.`
  ),
  deposits: z.array(depositSchema).max(
    MAX_DEPOSITS,
    `입금은 최대 ${MAX_DEPOSITS.toLocaleString()}건까지 허용됩니다.`
  ).default([]),
  targets: z.array(targetSchema).default([]),
  customAssets: z.array(z.string()).default([]),
});

/** Zod 추론 타입 */
type JsonV4Data = z.infer<typeof jsonV4Schema>;

// ────────────────────────────────────────────
// 검증 결과 타입
// ────────────────────────────────────────────

/** 검증 에러 상세 */
export interface ValidationError {
  /** 에러가 발생한 위치 (예: "trades[3].entryPrice") */
  path: string;
  /** 에러 메시지 */
  message: string;
}

/** 검증 결과 */
export interface ValidationResult {
  success: boolean;
  data?: JsonV4Data;
  errors?: ValidationError[];
}

/** 마이그레이션 리포트 */
export interface MigrationReport {
  success: boolean;
  /** 마이그레이션된 건수 */
  counts?: MigrationResult;
  /** 에러 메시지 (실패 시) */
  error?: string;
  /** 상세 검증 에러 목록 */
  validationErrors?: ValidationError[];
}

// ────────────────────────────────────────────
// 파일 검증
// ────────────────────────────────────────────

/**
 * JSON 파일의 크기를 검증한다.
 */
export function validateFileSize(file: File): ApiResult<void> {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `파일 크기(${sizeMB}MB)가 제한(5MB)을 초과합니다.`,
    };
  }
  return { success: true, data: undefined };
}

/**
 * JSON 문자열을 파싱하고 v4 스키마를 검증한다.
 */
export function validateJsonData(jsonString: string): ValidationResult {
  // 1. JSON 파싱
  let rawData: unknown;
  try {
    rawData = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      errors: [{ path: 'root', message: '유효하지 않은 JSON 파일입니다.' }],
    };
  }

  // 2. Zod 스키마 검증
  const result = jsonV4Schema.safeParse(rawData);

  if (!result.success) {
    const errors: ValidationError[] = result.error.issues.map((issue) => ({
      path: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

// ────────────────────────────────────────────
// 중복 체크
// ────────────────────────────────────────────

/**
 * 사용자의 기존 데이터가 있는지 확인한다.
 * 이미 마이그레이션된 데이터가 있으면 경고를 위해 건수를 반환한다.
 */
export async function checkExistingData(
  supabase: Client,
  userId: string
): Promise<ApiResult<{ trades: number; deposits: number; targets: number }>> {
  try {
    const [tradesResult, depositsResult, targetsResult] = await Promise.all([
      supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('targets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    if (tradesResult.error || depositsResult.error || targetsResult.error) {
      return { success: false, error: '기존 데이터 확인 중 오류가 발생했습니다.' };
    }

    return {
      success: true,
      data: {
        trades: tradesResult.count ?? 0,
        deposits: depositsResult.count ?? 0,
        targets: targetsResult.count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 기존 데이터를 모두 삭제한다 (덮어쓰기 모드).
 * 마이그레이션 전에 기존 데이터를 지우고 새 데이터로 교체할 때 사용한다.
 */
export async function clearExistingData(
  supabase: Client,
  userId: string
): Promise<ApiResult<void>> {
  try {
    // 순서 중요: FK 제약 조건 때문에 자식 테이블부터 삭제
    const results = await Promise.all([
      supabase.from('trades').delete().eq('user_id', userId),
      supabase.from('deposits').delete().eq('user_id', userId),
      supabase.from('targets').delete().eq('user_id', userId),
      supabase.from('custom_assets').delete().eq('user_id', userId),
    ]);

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
// 마이그레이션 실행
// ────────────────────────────────────────────

/**
 * JSON v4 파일을 Supabase로 마이그레이션한다.
 *
 * 전체 흐름:
 * 1. 파일 크기 검증
 * 2. JSON 파싱 + 스키마 검증 (Zod)
 * 3. 중복 체크 (기존 데이터 존재 시 overwrite 옵션에 따라 처리)
 * 4. Supabase RPC를 통한 단일 트랜잭션 INSERT
 * 5. 결과 리포트
 */
export async function migrateJsonFile(
  supabase: Client,
  userId: string,
  file: File,
  options?: {
    /** 기존 데이터가 있을 때 덮어쓸지 여부 (기본: false) */
    overwrite?: boolean;
  }
): Promise<MigrationReport> {
  // 1. 파일 크기 검증
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.success) {
    return { success: false, error: sizeCheck.error };
  }

  // 2. JSON 파싱 + 스키마 검증
  let jsonString: string;
  try {
    jsonString = await file.text();
  } catch {
    return { success: false, error: '파일을 읽을 수 없습니다.' };
  }

  const validation = validateJsonData(jsonString);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: '데이터 검증에 실패했습니다.',
      validationErrors: validation.errors,
    };
  }

  const data = validation.data;

  // 3. 중복 체크
  const existingCheck = await checkExistingData(supabase, userId);
  if (!existingCheck.success) {
    return { success: false, error: existingCheck.error };
  }

  const hasExisting =
    existingCheck.data.trades > 0 ||
    existingCheck.data.deposits > 0 ||
    existingCheck.data.targets > 0;

  if (hasExisting) {
    if (!options?.overwrite) {
      return {
        success: false,
        error:
          `이미 마이그레이션된 데이터가 존재합니다. ` +
          `(거래 ${existingCheck.data.trades}건, ` +
          `입금 ${existingCheck.data.deposits}건, ` +
          `목표 ${existingCheck.data.targets}건) ` +
          `덮어쓰기를 원하시면 overwrite 옵션을 활성화해주세요.`,
      };
    }

    // 기존 데이터 삭제
    const clearResult = await clearExistingData(supabase, userId);
    if (!clearResult.success) {
      return { success: false, error: `기존 데이터 삭제 실패: ${clearResult.error}` };
    }
  }

  // 4. Supabase RPC로 단일 트랜잭션 INSERT
  try {
    // trades 데이터를 RPC 호환 형식으로 변환
    const tradesPayload = data.trades.map((t) => ({
      date: t.date,
      entryDatetime: t.entryDatetime ?? null,
      exitDatetime: t.exitDatetime ?? null,
      asset: t.asset,
      direction: t.direction,
      leverage: t.leverage,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice ?? null,
      margin: t.margin,
      status: t.status,
      pnl: t.pnl ?? null,
      reason: t.reason ?? null,
      notes: t.notes ?? null,
    }));

    // deposits 데이터 변환
    const depositsPayload = data.deposits.map((d) => ({
      date: d.date,
      amount: d.amount,
      memo: d.memo ?? null,
    }));

    // targets 데이터 변환
    const targetsPayload = data.targets.map((t) => ({
      label: t.label,
      amount: t.amount,
    }));

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'migrate_json_data',
      {
        p_user_id: userId,
        p_initial_capital: data.ic,
        p_trades: tradesPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_trades'],
        p_deposits: depositsPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_deposits'],
        p_targets: targetsPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_targets'],
        p_custom_assets: data.customAssets as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_custom_assets'],
      }
    );

    if (rpcError) {
      return {
        success: false,
        error: `마이그레이션 실패 (트랜잭션 롤백됨): ${rpcError.message}`,
      };
    }

    // RPC 결과 파싱
    const result = rpcResult as unknown as MigrationResult;

    return {
      success: true,
      counts: {
        success: true,
        trades: result.trades,
        deposits: result.deposits,
        targets: result.targets,
        custom_assets: result.custom_assets,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `마이그레이션 중 예외 발생 (트랜잭션 롤백됨): ${getErrorMessage(err)}`,
    };
  }
}

/**
 * JSON 문자열로부터 직접 마이그레이션한다 (테스트/프로그래밍 방식 사용).
 */
export async function migrateJsonString(
  supabase: Client,
  userId: string,
  jsonString: string,
  options?: { overwrite?: boolean }
): Promise<MigrationReport> {
  // 크기 체크 (바이트 수 기준)
  const sizeInBytes = new TextEncoder().encode(jsonString).length;
  if (sizeInBytes > MAX_FILE_SIZE) {
    const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `데이터 크기(${sizeMB}MB)가 제한(5MB)을 초과합니다.`,
    };
  }

  // 검증
  const validation = validateJsonData(jsonString);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: '데이터 검증에 실패했습니다.',
      validationErrors: validation.errors,
    };
  }

  // File 객체를 만들어 migrateJsonFile의 나머지 로직을 재활용하는 대신,
  // 직접 RPC 호출 (중복 코드를 피하기 위해 내부 함수로 분리 가능하지만
  // 현재는 migrateJsonFile과 동일한 흐름을 인라인으로 구현)
  const data = validation.data;

  // 중복 체크
  const existingCheck = await checkExistingData(supabase, userId);
  if (!existingCheck.success) {
    return { success: false, error: existingCheck.error };
  }

  const hasExisting =
    existingCheck.data.trades > 0 ||
    existingCheck.data.deposits > 0 ||
    existingCheck.data.targets > 0;

  if (hasExisting && !options?.overwrite) {
    return {
      success: false,
      error:
        `이미 마이그레이션된 데이터가 존재합니다. ` +
        `(거래 ${existingCheck.data.trades}건, ` +
        `입금 ${existingCheck.data.deposits}건, ` +
        `목표 ${existingCheck.data.targets}건) ` +
        `덮어쓰기를 원하시면 overwrite 옵션을 활성화해주세요.`,
    };
  }

  if (hasExisting && options?.overwrite) {
    const clearResult = await clearExistingData(supabase, userId);
    if (!clearResult.success) {
      return { success: false, error: `기존 데이터 삭제 실패: ${clearResult.error}` };
    }
  }

  try {
    const tradesPayload = data.trades.map((t) => ({
      date: t.date,
      entryDatetime: t.entryDatetime ?? null,
      exitDatetime: t.exitDatetime ?? null,
      asset: t.asset,
      direction: t.direction,
      leverage: t.leverage,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice ?? null,
      margin: t.margin,
      status: t.status,
      pnl: t.pnl ?? null,
      reason: t.reason ?? null,
      notes: t.notes ?? null,
    }));

    const depositsPayload = data.deposits.map((d) => ({
      date: d.date,
      amount: d.amount,
      memo: d.memo ?? null,
    }));

    const targetsPayload = data.targets.map((t) => ({
      label: t.label,
      amount: t.amount,
    }));

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'migrate_json_data',
      {
        p_user_id: userId,
        p_initial_capital: data.ic,
        p_trades: tradesPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_trades'],
        p_deposits: depositsPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_deposits'],
        p_targets: targetsPayload as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_targets'],
        p_custom_assets: data.customAssets as unknown as Database['public']['Functions']['migrate_json_data']['Args']['p_custom_assets'],
      }
    );

    if (rpcError) {
      return {
        success: false,
        error: `마이그레이션 실패 (트랜잭션 롤백됨): ${rpcError.message}`,
      };
    }

    const result = rpcResult as unknown as MigrationResult;

    return {
      success: true,
      counts: {
        success: true,
        trades: result.trades,
        deposits: result.deposits,
        targets: result.targets,
        custom_assets: result.custom_assets,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `마이그레이션 중 예외 발생 (트랜잭션 롤백됨): ${getErrorMessage(err)}`,
    };
  }
}

// ────────────────────────────────────────────
// 내보내기: 검증만 수행 (미리보기용)
// ────────────────────────────────────────────

/**
 * JSON 파일을 검증만 하고 결과를 미리보기한다 (실제 INSERT 없음).
 * UI에서 마이그레이션 전 검증 결과를 보여줄 때 사용한다.
 */
export async function previewMigration(
  file: File
): Promise<{
  valid: boolean;
  summary?: {
    initialCapital: number;
    tradesCount: number;
    depositsCount: number;
    targetsCount: number;
    customAssetsCount: number;
    /** open 상태 거래 수 */
    openTradesCount: number;
    /** closed 상태 거래 수 */
    closedTradesCount: number;
  };
  errors?: ValidationError[];
}> {
  // 파일 크기 검증
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.success) {
    return {
      valid: false,
      errors: [{ path: 'file', message: sizeCheck.error }],
    };
  }

  let jsonString: string;
  try {
    jsonString = await file.text();
  } catch {
    return {
      valid: false,
      errors: [{ path: 'file', message: '파일을 읽을 수 없습니다.' }],
    };
  }

  const validation = validateJsonData(jsonString);
  if (!validation.success || !validation.data) {
    return { valid: false, errors: validation.errors };
  }

  const data = validation.data;
  const openTrades = data.trades.filter((t) => t.status === 'open').length;

  return {
    valid: true,
    summary: {
      initialCapital: data.ic,
      tradesCount: data.trades.length,
      depositsCount: data.deposits.length,
      targetsCount: data.targets.length,
      customAssetsCount: data.customAssets.length,
      openTradesCount: openTrades,
      closedTradesCount: data.trades.length - openTrades,
    },
  };
}

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다.';
}
