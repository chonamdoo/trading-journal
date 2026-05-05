import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import type { AuthUserId } from '../../domain/entities/auth-user';
import type { UserProfile, UserProfileUpdate } from '../../domain/entities/user-profile';
import type { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import type { UserProfileRowDto } from '../dto/user-profile-row.dto';
import {
  mapProfileRowToUserProfile,
  mapUserProfileUpdateToProfileUpdate,
} from '../mappers/user-profile.mapper';

type Client = SupabaseClient<Database>;

export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(private readonly supabase: Client) {}

  async findByAuthUserId(authUserId: AuthUserId): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapProfileRowToUserProfile(data as UserProfileRowDto);
  }

  async updateByAuthUserId(
    authUserId: AuthUserId,
    update: UserProfileUpdate,
  ): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(mapUserProfileUpdateToProfileUpdate(update))
      .eq('id', authUserId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapProfileRowToUserProfile(data as UserProfileRowDto);
  }
}
