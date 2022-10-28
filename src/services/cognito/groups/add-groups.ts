import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommandOutput,
  AdminAddUserToGroupCommand,
  AdminAddUserToGroupCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfigVariable } from 'src/utils/env';
import logger from 'src/services/logger';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const addUserToGroups = async (
  email: string,
  groups: string[],
): Promise<void> => {
  if (!groups.length) {
    return;
  }

  const addToGroups: Array<
    Promise<AdminAddUserToGroupCommandOutput>
  > = groups.map<Promise<AdminAddUserToGroupCommandOutput>>(
    (group: string): Promise<AdminAddUserToGroupCommandOutput> => {
      const input: AdminAddUserToGroupCommandInput = {
        GroupName: group,
        UserPoolId: getConfigVariable('USER_POOL_ID'),
        Username: email,
      };
      const command: AdminAddUserToGroupCommand = new AdminAddUserToGroupCommand(
        input,
      );
      logger.debug('Cognito.AdminAddUserToGroupCommand', { data: input });
      return client.send<
        AdminAddUserToGroupCommandInput,
        AdminAddUserToGroupCommandOutput
      >(command);
    },
  );

  try {
    await Promise.all<AdminAddUserToGroupCommandOutput>(addToGroups);
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.AdminAddUserToGroupCommand: ${name}: ${message}`, {
      error,
    });
    throw error;
  }
};
