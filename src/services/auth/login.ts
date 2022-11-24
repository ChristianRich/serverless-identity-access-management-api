import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import { auth } from '@/services/cognito/auth';
import { verifyToken } from '@/services/auth/verify-token';
import { updateLastLoginTimeStamp } from '@/services/dynamo/user-table/user';
import {
  CognitoAccessTokenPayload,
  CognitoIdOrAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';
import { User } from '@/types/user';
import createError from 'http-errors';
import { UserStatus } from 'aws-lambda';
import { getUserById } from '../dynamo/user-table/get';

export const login = async (
  email: string,
  password: string,
): Promise<AuthenticationResultType> => {
  const authenticationResult: AuthenticationResultType = await auth(
    email,
    password,
  );

  const { AccessToken } = authenticationResult;

  // Pulling out the claims to get the userId
  const claims: CognitoIdOrAccessTokenPayload<
    CognitoIdTokenPayload,
    CognitoAccessTokenPayload
  > = await verifyToken(AccessToken);

  const user: User | null = await getUserById(claims.sub);

  if (!user) {
    throw createError(404);
  }

  if (!canLogin(user)) {
    throw createError(403);
  }

  await updateLastLoginTimeStamp(claims.sub);
  return authenticationResult;
};

export const canLogin = (user: User): boolean =>
  user.status === <UserStatus>'UNCONFIRMED' ||
  user.status === <UserStatus>'CONFIRMED';
