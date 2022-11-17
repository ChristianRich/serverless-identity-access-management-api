import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  CreateGroupCommandInput,
  CreateGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import logger from 'src/services/logger';
import { Config } from '@/constants';
import { groupExists } from './get-group';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// Note: Initial user groups for USER, MODERATOR and ADMIN are created via serverless.yml
export const createGroup = async (
  name: string,
): Promise<CreateGroupCommandOutput | undefined> => {
  const exists = await groupExists(name);

  if (exists) {
    logger.warn(
      `Cognito.CreateGroupCommandOutput: Group '${name}' already exists (skip creation)`,
      { data: { name } },
    );
    return undefined;
  }

  const input: CreateGroupCommandInput = {
    GroupName: name,
    UserPoolId: getConfig(Config.COGNITO_POOL_ID),
  };

  const command: CreateGroupCommand = new CreateGroupCommand(input);

  try {
    logger.debug('Cognito.CreateGroupCommand', { data: { name } });
    return client.send<CreateGroupCommandInput, CreateGroupCommandOutput>(
      command,
    );
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.CreateGroupCommand: ${name}: ${message}`, {
      data: { input },
    });
    throw error;
  }
};
