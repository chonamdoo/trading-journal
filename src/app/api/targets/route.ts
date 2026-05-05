import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createCapitalTargetsCompositionRoot } from '@/features/capital-targets/di.server';
import { mapCapitalTargetToResponse } from '@/features/capital-targets/presentation/mappers/capital-target-response.mapper';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const targets = await createCapitalTargetsCompositionRoot(supabase)
        .listCapitalTargets
        .execute({ userId });
      return NextResponse.json({
        success: true,
        data: targets.map(mapCapitalTargetToResponse),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const body = await req.json() as { label: string; amount: number };
      const target = await createCapitalTargetsCompositionRoot(supabase)
        .createCapitalTarget
        .execute({ userId, label: body.label, amount: body.amount });
      return NextResponse.json(
        { success: true, data: mapCapitalTargetToResponse(target) },
        { status: 201 },
      );
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
