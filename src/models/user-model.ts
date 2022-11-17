import { JSONValue } from '@/types';
import { UserStatus } from 'aws-lambda';
import { User, UserBadge, UserBio, UserRole } from '../types/user';

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
  readonly bio?: UserBio;
  readonly data?: JSONValue;
  readonly $devTest?: JSONValue; // Handy for automated dev testing

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.handle = user.handle;
    this.createdAt = user.createdAt;
    this.lastLoginAt = user.lastLoginAt;
    this.email = user.email;
    this.role = user.role;
    this.status = <UserStatus>user.status;
    this.bio = user.bio;
    // this.badges = user.badges;
    this.badges = []; // TODO upload icons to S3 and reference
    this.data = user.data;

    if (process.env.NODE_ENV !== 'prd') {
      this.$devTest = {
        activationCode: user?.activationCode,
      };
    }
  }
}
