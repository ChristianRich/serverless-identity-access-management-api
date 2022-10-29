import { AppConfig } from '@/constants';
import {
  AdminSetUserPasswordCommandInput,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from 'src/services/logger';
import { getConfig } from 'src/utils/env';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// Set password for newly created user
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/adminsetuserpasswordcommand.html
export const setPassword = async (
  email: string,
  password: string,
): Promise<void> => {
  const input: AdminSetUserPasswordCommandInput = {
    Password: password,
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
    Username: email,
    Permanent: true,
  };

  const command: AdminSetUserPasswordCommand = new AdminSetUserPasswordCommand(
    input,
  );

  try {
    logger.debug('Cognito.AdminSetUserPasswordCommand', { data: input });
    await client.send(command);
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.AdminSetUserPasswordCommand: ${name}: ${message}`, {
      error,
      input,
    });
    throw error;
  }
};
