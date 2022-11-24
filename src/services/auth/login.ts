import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import { auth } from '@/services/cognito/auth';
import { verifyToken } from '@/services/auth/verify-token';
import { updateLastLoginTimeStamp } from '@/services/dynamo/user-table/user';
import {
  CognitoAccessTokenPayload,
  CognitoIdOrAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';

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

  await updateLastLoginTimeStamp(claims.sub);
  return authenticationResult;
};
