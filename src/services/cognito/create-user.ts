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
import { AppConfig } from '@/constants';

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
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
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

  const command: AdminCreateUserCommand = new AdminCreateUserCommand(input);

  try {
    logger.debug('Cognito.AdminCreateUserCommandOutput', { data: input });
    const output: AdminCreateUserCommandOutput = await client.send(command);

    if (!output?.User) {
      throw createError(
        500,
        'Exception during account registration: User is null',
      );
    }

    return output.User;
  } catch (error) {
    const { name } = <Error>error;
    const message = `Cognito.AdminCreateUserCommandOutput: ${name}: ${error.message}`;

    if (name === 'UsernameExistsException') {
      logger.warn(message, { data: email });
    } else {
      logger.error(message, { data: email });
    }

    throw error;
  }
};
