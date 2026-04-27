import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, RATE_LIMITS } from '@/lib/api/auth';

export const runtime = 'nodejs';

const BUCKET = 'trade-screenshots';
const STORAGE_REMOVE_CHUNK = 100;

const BodySchema = z.object({
  confirm: z.literal('초기화'),
}).strict();

interface RpcResult {
  success: boolean;
  trades: number;
  deposits: number;
  targets: number;
  monthly_reports: number;
  weekly_reports: number;
  trading_plans: number;
}

interface ResetResult extends RpcResult {
  storage_files_removed: number;
  storage_files_failed: number;
}

export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async (supabase, userId) => {
      // 1. Body Zod 검증 — confirm 문자열 정확히 "초기화"
      let raw: unknown;
      try {
        raw = await req.json();
      } catch {
        return NextResponse.json({ error: '잘못된 요청 본문입니다.' }, { status: 400 });
      }
      const parsed = BodySchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: '확인 텍스트가 일치하지 않습니다.' },
          { status: 400 },
        );
      }

      // 2. Storage path 사전 수집 (RPC 가 DB 지우면 path 잃음)
      const { data: pathRows, error: pathError } = await supabase
        .from('trade_screenshots')
        .select('storage_path')
        .eq('user_id', userId);

      if (pathError) {
        console.error('[reset] storage path query failed', { userId, error: pathError.message });
        return NextResponse.json({ error: '데이터 조회에 실패했습니다.' }, { status: 500 });
      }
      // Defense-in-Depth: storage_path 가 본인 user_id 폴더로 시작하는지 강제 검증.
      // (storage_path 컬럼이 단순 TEXT 라 위조 INSERT 시 타 사용자 파일 삭제 위험 — 1차 가드)
      const userPrefix = `${userId}/`;
      const storagePaths = (pathRows ?? [])
        .map((r) => r.storage_path)
        .filter((p): p is string => typeof p === 'string' && p.length > 0 && p.startsWith(userPrefix));

      // 3. RPC — DB 트랜잭션 (CASCADE 로 trade_screenshots row 도 삭제)
      const { data: rpcData, error: rpcError } = await supabase.rpc('reset_user_data', {
        p_user_id: userId,
      });
      if (rpcError) {
        console.error('[reset] rpc failed', { userId, error: rpcError.message });
        return NextResponse.json({ error: '초기화에 실패했습니다.' }, { status: 500 });
      }
      // RPC 결과 typeguard
      if (!rpcData || typeof rpcData !== 'object' || !('trades' in rpcData)) {
        console.error('[reset] rpc returned unexpected shape', { userId, rpcData });
        return NextResponse.json({ error: '초기화 응답이 올바르지 않습니다.' }, { status: 500 });
      }
      const counts = rpcData as unknown as RpcResult;

      // 4. Storage 파일 일괄 삭제 — 100개 chunk. 실패는 로깅만, 200 응답 유지
      //    (DB 는 이미 정리됨. 잔존 파일은 cron/수동 청소로 보강)
      let removed = 0;
      let failed = 0;
      for (let i = 0; i < storagePaths.length; i += STORAGE_REMOVE_CHUNK) {
        const chunk = storagePaths.slice(i, i + STORAGE_REMOVE_CHUNK);
        const { data, error } = await supabase.storage.from(BUCKET).remove(chunk);
        if (error) {
          console.error('[reset] storage remove failed', { userId, error: error.message, chunkSize: chunk.length });
          failed += chunk.length;
        } else {
          removed += data?.length ?? chunk.length;
        }
      }

      const result: ResetResult = {
        ...counts,
        storage_files_removed: removed,
        storage_files_failed: failed,
      };
      return NextResponse.json({ success: true, data: result });
    },
    RATE_LIMITS.import,
  );
}
