import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Config } from '@/constants';
import { getConfig } from '@/utils/env';
import logger from '@/services/logger';
import {
  CognitoJwtVerifierProperties,
  CognitoJwtVerifierSingleUserPool,
} from 'aws-jwt-verify/cognito-verifier';
import {
  CognitoAccessTokenPayload,
  CognitoIdOrAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';

type TokenUse = 'access' | 'id';

export const verifyToken = async (
  token: string,
  tokenUse: TokenUse = 'access',
): Promise<
  CognitoIdOrAccessTokenPayload<
    CognitoIdTokenPayload,
    CognitoAccessTokenPayload
  >
> => {
  const verifier: CognitoJwtVerifierSingleUserPool<CognitoJwtVerifierProperties> = CognitoJwtVerifier.create(
    {
      userPoolId: getConfig(Config.COGNITO_POOL_ID),
      clientId: getConfig(Config.COGNITO_CLIENT_ID),
      tokenUse,
    },
  );

  try {
    const payload: CognitoIdOrAccessTokenPayload<
      CognitoIdTokenPayload,
      CognitoAccessTokenPayload
    > = await verifier.verify(token);

    return payload;
  } catch (error) {
    logger.warn('Token validation failed', { data: { token, tokenUse } });
    throw error;
  }
};
