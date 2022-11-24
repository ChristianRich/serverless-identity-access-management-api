import logger from '@/services/logger';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
  AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import { Config } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

/**
 * Authenticate user via credentials and issue tokens
 */
export const auth = async (
  email: string,
  password: string,
): Promise<AuthenticationResultType> => {
  const input: AdminInitiateAuthCommandInput = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: getConfig(Config.COGNITO_POOL_ID),
    ClientId: getConfig(Config.COGNITO_CLIENT_ID),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const command: AdminInitiateAuthCommand = new AdminInitiateAuthCommand(input);

  try {
    logger.debug('Cognito.AdminInitiateAuthCommand', { data: { email } });
    const output: AdminInitiateAuthCommandOutput = await client.send(command);
    const { AuthenticationResult } = output;
    return AuthenticationResult;
  } catch (error) {
    const { message, name } = error;
    logger.error(`Cognito.AdminInitiateAuthCommand: ${name}: ${message}`, {
      data: { email },
    });
    throw error;
  }
};
