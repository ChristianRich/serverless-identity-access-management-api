import { BADGES, Config } from '@/constants';
import { getConfig } from '@/utils/env';
import type { JsonObject } from 'type-fest';
import {
  User,
  UserBadge,
  UserBadgeName,
  UserProfileData,
  UserRole,
  UserStatus,
} from '../types/user';

const staticAssetsUrl = getConfig(Config.STATIC_ASSETS_URL);

// User model as returned by this API
export class UserModel {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly lastLoginAt?: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly sourceSystem?: string;
  readonly profile: {
    profileData: UserProfileData;
    badges: UserBadge[];
    data: JsonObject; // Unstructured user data
  };
  // Useful for automated testing
  readonly $devTest?: JsonObject;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.handle = user.handle;
    this.createdAt = user.createdAt;
    this.lastLoginAt = user.lastLoginAt;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.sourceSystem = user.sourceSystem;

    // Prepend absolute S3 URL to relative paths
    this.profile = {
      profileData: {
        ...user.profileData,
        avatarUrl: `${staticAssetsUrl}${user.profileData.avatarUrl}`,
      },
      badges: user.badges.map(
        (name: UserBadgeName): UserBadge => ({
          name,
          iconUrl: `${staticAssetsUrl}${BADGES[name]}`,
        }),
      ),
      data: user.data,
    };

    if (
      process.env.NODE_ENV === 'dev' &&
      user.status === 'UNCONFIRMED' &&
      user.activationCode
    ) {
      this.$devTest = {
        activationCode: user.activationCode,
      };
    }
  }
}
