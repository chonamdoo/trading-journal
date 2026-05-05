import type { AuthUserId } from '../entities/auth-user';
import type { UserProfile, UserProfileUpdate } from '../entities/user-profile';

export type UserProfileRepository = {
  findByAuthUserId(authUserId: AuthUserId): Promise<UserProfile | null>;
  updateByAuthUserId(authUserId: AuthUserId, update: UserProfileUpdate): Promise<UserProfile | null>;
};
