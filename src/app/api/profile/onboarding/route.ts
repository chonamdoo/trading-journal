import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createUserProfileCompositionRoot } from '@/features/user-profile/di.server';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const profile = await createUserProfileCompositionRoot(supabase).getUserProfile.execute({
        authUserId: userId,
      });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: { completed: profile.initialCapital > 0 },
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
