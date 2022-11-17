import {
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminCreateUserRequest,
  CognitoIdentityProviderClient,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from 'src/services/logger';
import { getConfig } from 'src/utils/env';
import createError from 'http-errors';
import { Config } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/admincreateusercommand.html
// Limited support for custom fields for Cognito users, hence we only capture ID fields for authentication purposes
export const createUser = async (
  email: string,
  name: string,
): Promise<UserType> => {
  const input: AdminCreateUserRequest = {
    UserPoolId: getConfig(Config.COGNITO_POOL_ID),
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'name',
        Value: name,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ],
    MessageAction: 'SUPPRESS',
  };

  try {
    logger.debug('Cognito.AdminCreateUserCommand', { data: input });
    const command: AdminCreateUserCommand = new AdminCreateUserCommand(input);
    const output: AdminCreateUserCommandOutput = await client.send(command);
    const { User: user } = output;

    if (!user) {
      throw createError(
        500,
        'Exception during account registration: User created failed',
      );
    }

    return user;
  } catch (error) {
    const { name } = <Error>error;
    const message = `Cognito.AdminCreateUserCommand: ${name}: ${error.message}`;

    if (name === 'UsernameExistsException') {
      logger.warn(message, { data: { input } });
    } else {
      logger.error(message, { data: { input } });
    }

    throw error;
  }
};
