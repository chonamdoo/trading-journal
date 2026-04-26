import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, RATE_LIMITS } from '@/lib/api/auth';

export const runtime = 'nodejs';

/** Body 크기 상한: 4MB (Vercel 서버리스 페이로드 한도 ~4.5MB 와 일관) */
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const TradeSchema = z.object({
  date: z.string().min(1),
  entryDatetime: z.string().nullish(),
  exitDatetime: z.string().nullish(),
  asset: z.string().min(1),
  direction: z.enum(['LONG', 'SHORT']),
  leverage: z.number().int().positive(),
  entryPrice: z.number().nonnegative(),
  exitPrice: z.number().nonnegative().nullish(),
  margin: z.number().nonnegative(),
  status: z.enum(['open', 'closed']).default('closed'),
  pnl: z.number().nullish(),
  reason: z.string().nullish(),
  notes: z.string().nullish(),
}).strict();

const DepositSchema = z.object({
  date: z.string().min(1),
  amount: z.number().nonnegative(),
  memo: z.string().nullish(),
}).strict();

const TargetSchema = z.object({
  label: z.string().min(1),
  amount: z.number().nonnegative(),
}).strict();

const ImportPayloadSchema = z.object({
  initialCapital: z.number().nonnegative(),
  trades: z.array(TradeSchema).max(10_000),
  deposits: z.array(DepositSchema).max(1_000),
  targets: z.array(TargetSchema).max(50),
  customAssets: z.array(z.string().min(1).max(20)).max(500),
}).strict();

interface RpcResult {
  success: boolean;
  trades: number;
  deposits: number;
  targets: number;
  custom_assets: number;
}

export async function POST(req: NextRequest) {
  // 1. Body 크기 사전 검사 (Content-Length 헤더 신뢰)
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: `파일이 너무 큽니다 (최대 ${MAX_BODY_BYTES / 1024 / 1024}MB).` },
      { status: 413 },
    );
  }

  return withAuth(
    req,
    async (supabase, userId) => {
      // 2. JSON 파싱 + 실제 본문 크기 재검사 (Content-Length 위조 방어)
      let raw: unknown;
      try {
        const text = await req.text();
        // UTF-16 char length 가 아닌 실제 UTF-8 바이트로 검사 (한글/이모지 정확)
        if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
          return NextResponse.json(
            { error: `파일이 너무 큽니다 (최대 ${MAX_BODY_BYTES / 1024 / 1024}MB).` },
            { status: 413 },
          );
        }
        raw = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'JSON 파일을 읽을 수 없습니다.' },
          { status: 400 },
        );
      }

      // 3. Zod 스키마 검증
      const parsed = ImportPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        const path = first?.path.join('.') ?? '';
        return NextResponse.json(
          { error: `스키마 오류: ${path} — ${first?.message ?? 'invalid'}` },
          { status: 400 },
        );
      }

      const payload = parsed.data;

      // 4. RPC 호출 (auth.uid = userId 가드는 RPC 내부에서 한 번 더)
      const { data, error } = await supabase.rpc('migrate_json_data', {
        p_user_id: userId,
        p_initial_capital: payload.initialCapital,
        p_trades: payload.trades,
        p_deposits: payload.deposits,
        p_targets: payload.targets,
        p_custom_assets: payload.customAssets,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        data: data as unknown as RpcResult,
      });
    },
    RATE_LIMITS.import,
  );
}
