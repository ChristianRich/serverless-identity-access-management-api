import type { JsonObject } from 'type-fest';

// Represents the user as persisted in DynamoDB
export type User = {
  // PK = Cognito user id
  readonly id: string;

  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly lastLoginAt?: string;
  readonly activationCode?: string;

  // (GSI)
  readonly email: string;

  // E.g christian_rich (GSI)
  readonly name: string;

  // E.g @ChristianRich (GSI)
  readonly handle: string;

  // IP at time of registration (KYC / "know your customer")
  readonly sourceIp: string;

  // Optional reference to external source system
  // This field is useful when the User API is shared across multiple websites / products
  readonly sourceSystem?: string;

  // USER, MODERATOR, ADMIN. Defaults to USER
  readonly role: UserRole;

  // Defaults to UNCONFIRMED (= reduced priviledges e.g no write access)
  readonly status: UserStatus;

  // Contains basic profile information
  readonly profileData: UserProfileData;

  // Unstructured / untyped data associated with this user
  // This object is CRUD accessible via HTTP/PUT and HTTP/PATCH
  readonly data?: JsonObject;

  // Badges are digital credentials representing specific learning skills and achievements
  readonly badges: UserBadgeName[];
};

// Add additional pieces of user profile data to this block
export type UserProfileData = {
  avatarUrl: string;
  about?: string;
  location?: string;
  lang?: string;
  currency?: string;
  // address
  // phone
  // ...
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
