import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from '@/services/logger';
import { getConfig } from 'src/utils/env';
import createError from 'http-errors';
import { Config } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const deleteUserById = async (
  id: string,
): Promise<AdminDeleteUserCommandOutput> => {
  const input: AdminDeleteUserCommandInput = {
    UserPoolId: getConfig(Config.COGNITO_USER_POOL_ID),
    Username: id,
  };

  const command: AdminDeleteUserCommand = new AdminDeleteUserCommand(input);

  try {
    logger.debug('Cognito.AdminDeleteUserCommand', { data: input });
    return client.send(command);
  } catch (error) {
    const { name } = <Error>error;
    const message = `Cognito.AdminDeleteUserCommand: ${name}: ${error.message}`;

    if (name === 'UserNotFoundException') {
      logger.warn(message, { data: { input } });
      throw createError(404);
    }

    logger.error(message, { data: { input } });
    throw error;
  }
};
