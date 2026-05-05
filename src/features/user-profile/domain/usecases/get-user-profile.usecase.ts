import type { AuthUserId } from '../entities/auth-user';
import type { UserProfileRepository } from '../repositories/user-profile.repository';

export type GetUserProfileRequest = {
  authUserId: AuthUserId;
};

export function createGetUserProfileUseCase(userProfileRepository: UserProfileRepository) {
  return {
    execute({ authUserId }: GetUserProfileRequest) {
      return userProfileRepository.findByAuthUserId(authUserId);
    },
  };
}
