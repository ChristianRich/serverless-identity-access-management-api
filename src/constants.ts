/* eslint-disable lines-between-class-members */
export class Config {
  static readonly COGNITO_POOL_ID = 'COGNITO_POOL_ID';
  static readonly COGNITO_CLIENT_ID = 'COGNITO_CLIENT_ID';
  static readonly USERS_TABLE_NAME = 'USERS_TABLE_NAME';
  static readonly STATIC_ASSETS_URL = 'STATIC_ASSETS_URL';
}

export enum COGNITO_USER_GROUP {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export const DEFAULT_USER_AVATAR_URL = '/avatars/x256/01.png';

export const BADGES = {
  NEW_MEMBER: '/badges/new-member.svg',
  CONVERSATION_STARTER: '/badges/conversation-starter.svg',
  VERIFIED_EMAIL: '/badges/verified-email.svg',
  COMPLETED_PROFILE: '/badges/completed-profile.svg',
  FEATURED_AUTHOR: '/badges/featured-author.svg',
  TOP_SELLER: '/badges/top-seller.svg',
  RISING_STAR: '/badges/rising-star.svg',
  FOUNDING_MEMBER: '/badges/founding-member.svg',
  TOP_REVIEWER: '/badges/top-reviewer.svg',
};
