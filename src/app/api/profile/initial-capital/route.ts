import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createUserProfileCompositionRoot } from '@/features/user-profile/di.server';
import { mapUserProfileToProfileResponse } from '@/features/user-profile/presentation/mappers/user-profile-response.mapper';

export async function PUT(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const body = await req.json() as { amount?: number };
      if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0) {
        return NextResponse.json({ error: 'Invalid initial capital' }, { status: 400 });
      }

      const profile = await createUserProfileCompositionRoot(supabase).updateUserProfile.execute({
        authUserId: userId,
        update: { initialCapital: body.amount },
      });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: mapUserProfileToProfileResponse(profile),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
