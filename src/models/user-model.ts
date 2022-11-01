import { User, UserBadge } from '../types/user';

export class UserModel {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly lastLoginAt?: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly bio?: Record<string, unknown>;
  // readonly badges: UserBadge[];
  readonly badges: UserBadge[] | string[];
  readonly data?: Record<string, unknown>;
  readonly $devTest: Record<string, unknown> | undefined; // Handy for automated testing flows
  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.handle = user.handle;
    this.createdAt = user.createdAt;
    this.lastLoginAt = user.lastLoginAt;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.bio = user.bio;
    this.badges = user.badges;
    // this.badges = [
    //   // TODO map function with cached lookup to other new table?
    //   {
    //     name: 'FOUNDING_MEMBER',
    //     description: 'Founding Member',
    //     iconUrl: 'https://example.com/icon.svg',
    //   },
    // ];
    this.data = user.data;

    // TODO
    this.$devTest = {
      activationCode: user?.activationCode,
    };
  }
}
