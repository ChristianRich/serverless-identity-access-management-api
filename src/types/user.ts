export type User = {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly lastLoginAt?: string;
  readonly activationCode: string;
  readonly email: string;
  readonly name: string;
  readonly handle: string;
  readonly sourceIp: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly bio?: UserBio;
  readonly badges: UserBadgeName[];
};

export type UserPermissions = 'product' | 'sdf';

export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
  sourceIp: string;
  'bio.avatarUrl'?: string;
  'bio.about'?: string;
  'bio.location'?: string;
};

export type UserBio = {
  avatarUrl?: string;
  about?: string;
  location?: string;
  badges?: UserBadge[];
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

// Stored in DynamoDB as type DocumentClient.DynamoDbSet
// 'NOOP' is a work-around DynamoDB's limitation of not allowing empty Sets
export type UserBadgeName =
  | 'NOOP'
  | 'NEW_MEMBER'
  | 'CONVERSATION_STARTER'
  | 'VERIFIED_EMAIL'
  | 'COMPLETED_PROFILE'
  | 'FEATURED_AUTHOR'
  | 'TOP_SELLER'
  | 'RISING_STAR'
  | 'FOUNDING_MEMBER';
