import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminGetUserRequest,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from '@/services/logger';
import { getConfig } from 'src/utils/env';
import createError from 'http-errors';
import { Config } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/admincreateusercommand.html
export const getUserById = async (
  id: string,
): Promise<AdminGetUserCommandOutput> => {
  const input: AdminGetUserRequest = {
    UserPoolId: getConfig(Config.COGNITO_POOL_ID),
    Username: id,
  };

  const command: AdminGetUserCommand = new AdminGetUserCommand(input);

  try {
    logger.debug('Cognito.AdminGetUserCommand', { data: input });
    return client.send(command);
  } catch (error) {
    const { name } = <Error>error;
    const message = `Cognito.AdminGetUserCommand: ${name}: ${error.message}`;

    if (name === 'UserNotFoundException') {
      logger.warn(message, { data: { input } });
      throw createError(404);
    }

    logger.error(message, { data: { input } });
    throw error;
  }
};
