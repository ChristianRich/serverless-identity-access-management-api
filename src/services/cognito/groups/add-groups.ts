import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommandOutput,
  AdminAddUserToGroupCommand,
  AdminAddUserToGroupCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import logger from '@/services/logger';
import { Config } from '@/constants';
import createError from 'http-errors';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// Add user to a single group
export const addUserToGroup = async (
  email: string,
  group: string,
): Promise<AdminAddUserToGroupCommandOutput> => {
  const input: AdminAddUserToGroupCommandInput = {
    GroupName: group,
    UserPoolId: getConfig(Config.COGNITO_USER_POOL_ID),
    Username: email,
  };

  const command: AdminAddUserToGroupCommand = new AdminAddUserToGroupCommand(
    input,
  );

  logger.debug('Cognito.AdminAddUserToGroupCommand', { data: { input } });

  return client.send<
    AdminAddUserToGroupCommandInput,
    AdminAddUserToGroupCommandOutput
  >(command);
};

// Add user to a one or multiple group
export const addUserToGroups = async (
  email: string,
  groups: string[],
): Promise<void> => {
  if (!groups.length) {
    throw createError(
      400,
      `Error adding user ${email} to group: At least one group must be provided`,
    );
  }

  try {
    await Promise.all<AdminAddUserToGroupCommandOutput>(
      groups.map(
        (group: string): Promise<AdminAddUserToGroupCommandOutput> =>
          addUserToGroup(email, group),
      ),
    );
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.AdminAddUserToGroupCommand: ${name}: ${message}`, {
      data: { email, groups },
    });
    throw error;
  }
};
