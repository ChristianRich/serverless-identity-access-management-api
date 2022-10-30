import {
  CognitoIdentityProviderClient,
  GetGroupCommand,
  GetGroupCommandInput,
  GetGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import logger from 'src/services/logger';
import { AppConfig } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const getGroup = async (
  name: string,
): Promise<GetGroupCommandOutput> => {
  const input: GetGroupCommandInput = {
    GroupName: name,
    UserPoolId: getConfig(AppConfig.USER_POOL_ID),
  };

  const command: GetGroupCommand = new GetGroupCommand(input);

  try {
    logger.debug('Cognito.GetGroupCommand', { data: input });
    return client.send<GetGroupCommandInput, GetGroupCommandOutput>(command);
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.GetGroupCommand: ${name}: ${message}`, {
      error,
      input,
    });
    throw error;
  }
};

export const groupExists = async (name: string): Promise<boolean> =>
  !!(await getGroup(name));
