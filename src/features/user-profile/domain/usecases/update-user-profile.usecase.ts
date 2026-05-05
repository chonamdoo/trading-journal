import type { AuthUserId } from '../entities/auth-user';
import type { UserProfileUpdate } from '../entities/user-profile';
import { sanitizeUserProfileUpdate } from '../entities/user-profile';
import type { UserProfileRepository } from '../repositories/user-profile.repository';

export type UpdateUserProfileRequest = {
  authUserId: AuthUserId;
  update: UserProfileUpdate;
};

export function createUpdateUserProfileUseCase(userProfileRepository: UserProfileRepository) {
  return {
    execute({ authUserId, update }: UpdateUserProfileRequest) {
      return userProfileRepository.updateByAuthUserId(
        authUserId,
        sanitizeUserProfileUpdate(update),
      );
    },
  };
}
