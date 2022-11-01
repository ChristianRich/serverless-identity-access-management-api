import { AppConfig } from '@/constants';
import { getConfig } from '@/utils/env';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import logger from '../logger';

type TokenUse = 'access' | 'id';

export const verifyToken = async (
  token: string,
  tokenUse: TokenUse = 'access',
): Promise<unknown> => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: getConfig(AppConfig.COGNITO_POOL_ID),
    clientId: getConfig(AppConfig.COGNITO_CLIENT_ID),
    tokenUse,
  });

  try {
    const payload = await verifier.verify(token);
    return payload;
  } catch (error) {
    logger.warn('Token validation failed', { data: token });
    throw error;
  }
};
