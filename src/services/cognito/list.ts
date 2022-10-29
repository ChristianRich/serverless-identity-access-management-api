import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

import { getConfig } from 'src/utils/env';
import logger from 'src/services/logger';
import { AppConfig } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const listUsers = async (): Promise<ListUsersCommandOutput> => {
  const input: ListUsersCommandInput = {
    // AttributesToGet: ["string"],
    // Filter: "string",
    // Limit: 100,
    // PaginationToken: "string",
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
  };

  const command: ListUsersCommand = new ListUsersCommand(input);

  try {
    logger.debug('Cognito.ListUsersCommandOutput', { data: input });
    const output: ListUsersCommandOutput = await client.send(command);
    return output;
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.ListUsersCommandOutput: ${name}: ${message}`, {
      error,
      input,
    });
    throw error;
  }
};