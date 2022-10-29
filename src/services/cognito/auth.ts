import logger from 'src/services/logger';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
  AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import { AppConfig } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// Authenticate user and issue tokens
export const auth = async (
  email: string,
  password: string,
): Promise<AuthenticationResultType> => {
  const input: AdminInitiateAuthCommandInput = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
    ClientId: getConfig(AppConfig.CLIENT_ID),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const command: AdminInitiateAuthCommand = new AdminInitiateAuthCommand(input);

  try {
    logger.debug('Cognito.AdminInitiateAuthCommandOutput', { data: input });
    const output: AdminInitiateAuthCommandOutput = await client.send(command);
    return <AuthenticationResultType>output.AuthenticationResult;
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(
      `Cognito.AdminInitiateAuthCommandOutput: ${name}: ${message}`,
      {
        error,
        input,
      },
    );
    throw error;
  }
};
