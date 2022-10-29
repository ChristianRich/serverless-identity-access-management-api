import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  CreateGroupCommandInput,
  CreateGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import logger from 'src/services/logger';
import { AppConfig } from '@/constants';
import { groupExists } from './get-group';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

// Don't use this, create groups via serverless.yaml config
export const createGroup = async (
  name: string,
): Promise<CreateGroupCommandOutput | undefined> => {
  const exists: boolean = await groupExists(name);

  if (exists) {
    logger.warn(
      `Cognito.CreateGroupCommandOutput: Group '${name}' already exists (skip creation)`,
      { data: { name } },
    );
    return undefined;
  }

  const input: CreateGroupCommandInput = {
    GroupName: name,
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
  };

  const command: CreateGroupCommand = new CreateGroupCommand(input);

  try {
    logger.debug('Cognito.CreateGroupCommandOutput', { data: { name } });
    return client.send<CreateGroupCommandInput, CreateGroupCommandOutput>(
      command,
    );
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.CreateGroupCommandOutput: ${name}: ${message}`, {
      error,
      input,
    });
    throw error;
  }
};
