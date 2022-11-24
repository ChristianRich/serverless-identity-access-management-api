import { BADGES, Config } from '@/constants';
import { getConfig } from '@/utils/env';
import { UserStatus } from 'aws-lambda';
import type { JsonObject } from 'type-fest';
import { User, UserBadge, UserBadgeName, UserRole } from '../types/user';

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
  readonly badges: UserBadge[];
  readonly bio: JsonObject;
  readonly data?: JsonObject;

  // Useful for automated testing
  readonly $devTest?: JsonObject;

  constructor(user: User) {
    const staticAssetsUrl = getConfig(Config.STATIC_ASSETS_URL);

    this.id = user.id;
    this.name = user.name;
    this.handle = user.handle;
    this.createdAt = user.createdAt;
    this.lastLoginAt = user.lastLoginAt;
    this.email = user.email;
    this.role = user.role;
    this.status = <UserStatus>user.status;
    this.data = user.data;
    this.bio = {
      ...user.bio,
      avatarUrl: `${staticAssetsUrl}${user.bio.avatarUrl}`,
      badges: user.badges.map(
        (name: UserBadgeName): UserBadge => ({
          name,
          iconUrl: `${staticAssetsUrl}${BADGES[name]}`,
        }),
      ),
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
