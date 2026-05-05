import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import type { TargetUpdate } from '@/lib/supabase/types';
import { createCapitalTargetsCompositionRoot } from '@/features/capital-targets/di.server';
import { mapTargetUpdateRequest } from '@/features/capital-targets/presentation/mappers/capital-target-request.mapper';
import { mapCapitalTargetToResponse } from '@/features/capital-targets/presentation/mappers/capital-target-response.mapper';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    try {
      const body = await req.json() as TargetUpdate;
      const target = await createCapitalTargetsCompositionRoot(supabase)
        .updateCapitalTarget
        .execute({ targetId: id, update: mapTargetUpdateRequest(body) });
      return NextResponse.json({
        success: true,
        data: mapCapitalTargetToResponse(target),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    try {
      await createCapitalTargetsCompositionRoot(supabase)
        .deleteCapitalTarget
        .execute({ targetId: id });
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
