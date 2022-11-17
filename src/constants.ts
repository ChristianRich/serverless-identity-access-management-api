/* eslint-disable lines-between-class-members */
export class Config {
  static readonly COGNITO_POOL_ID = 'COGNITO_POOL_ID';
  static readonly COGNITO_CLIENT_ID = 'COGNITO_CLIENT_ID';
  static readonly USERS_TABLE_NAME = 'USERS_TABLE_NAME';
}

export enum COGNITO_USER_GROUP {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}
