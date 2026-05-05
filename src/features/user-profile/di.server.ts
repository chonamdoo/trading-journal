import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import { SupabaseUserProfileRepository } from './data/repositories/supabase-user-profile.repository.server';
import { createGetUserProfileUseCase } from './domain/usecases/get-user-profile.usecase';
import { createUpdateUserProfileUseCase } from './domain/usecases/update-user-profile.usecase';

export function createUserProfileCompositionRoot(supabase: SupabaseClient<Database>) {
  const userProfileRepository = new SupabaseUserProfileRepository(supabase);

  return {
    getUserProfile: createGetUserProfileUseCase(userProfileRepository),
    updateUserProfile: createUpdateUserProfileUseCase(userProfileRepository),
  };
}
