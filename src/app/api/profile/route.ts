import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import type { ProfileUpdate } from '@/lib/supabase/types';
import { createUserProfileCompositionRoot } from '@/features/user-profile/di.server';
import { mapProfileUpdateRequest } from '@/features/user-profile/presentation/mappers/user-profile-request.mapper';
import { mapUserProfileToProfileResponse } from '@/features/user-profile/presentation/mappers/user-profile-response.mapper';

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

export async function PUT(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    try {
      const body = await req.json() as ProfileUpdate;
      const profile = await createUserProfileCompositionRoot(supabase).updateUserProfile.execute({
        authUserId: userId,
        update: mapProfileUpdateRequest(body),
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
