import type { JsonObject } from 'type-fest';

export type User = {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly lastLoginAt?: string;
  readonly activationCode: string;
  readonly email: string;
  readonly name: string;
  readonly handle: string;
  readonly sourceIp: string; // IP at time of registration
  readonly sourceSystem?: string; // Reference to external source system (user DB could be shared among several apps)
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly bio?: UserBio;
  readonly data?: JsonObject; // Unstructured data associated with this user (CRUD accessible)
  readonly badges: UserBadgeName[]; // Badges are digital credentials representing specific learning skills and achievements
};

export type UserBio = {
  avatarUrl: string;
  about?: string;
  location?: string;
};

export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
  sourceIp: string;
  sourceSystem?: string;
};

export type UserBadge = {
  name: UserBadgeName;
  iconUrl: string;
  description?: string;
};

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type UserStatus =
  | 'UNCONFIRMED'
  | 'CONFIRMED'
  | 'ARCHIVED'
  | 'COMPROMISED'
  | 'SUSPENDED'
  | 'UNKNOWN'
  | 'RESET_REQUIRED'
  | 'FORCE_CHANGE_PASSWORD';

export type UserBadgeName =
  | 'NEW_MEMBER'
  | 'CONVERSATION_STARTER'
  | 'VERIFIED_EMAIL'
  | 'COMPLETED_PROFILE'
  | 'FEATURED_AUTHOR'
  | 'TOP_SELLER'
  | 'RISING_STAR'
  | 'FOUNDING_MEMBER'
  | 'TOP_REVIEWER';
