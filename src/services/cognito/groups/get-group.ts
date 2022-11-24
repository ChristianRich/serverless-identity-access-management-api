import {
  CognitoIdentityProviderClient,
  GetGroupCommand,
  GetGroupCommandInput,
  GetGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfig } from 'src/utils/env';
import logger from '@/services/logger';
import { Config } from '@/constants';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const getGroup = async (
  name: string,
): Promise<GetGroupCommandOutput> => {
  const input: GetGroupCommandInput = {
    GroupName: name,
    UserPoolId: getConfig(Config.COGNITO_USER_POOL_ID),
  };

  const command: GetGroupCommand = new GetGroupCommand(input);

  try {
    logger.debug('Cognito.GetGroupCommand', { data: input });
    return client.send<GetGroupCommandInput, GetGroupCommandOutput>(command);
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.GetGroupCommand: ${name}: ${message}`, {
      data: { input },
    });
    throw error;
  }
};

export const groupExists = async (name: string): Promise<boolean> =>
  !!(await getGroup(name));
