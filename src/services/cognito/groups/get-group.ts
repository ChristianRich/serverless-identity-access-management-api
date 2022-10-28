import {
  CognitoIdentityProviderClient,
  GetGroupCommand,
  GetGroupCommandInput,
  GetGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { getConfigVariable } from 'src/utils/env';
import logger from 'src/services/logger';

const client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(
  {},
);

export const getGroup = async (
  name: string,
): Promise<GetGroupCommandOutput> => {
  const input: GetGroupCommandInput = {
    GroupName: name,
    UserPoolId: getConfigVariable('USER_POOL_ID'),
  };

  const command: GetGroupCommand = new GetGroupCommand(input);

  try {
    logger.debug('Cognito.GetGroupCommandOutput', { data: input });
    return client.send<GetGroupCommandInput, GetGroupCommandOutput>(command);
  } catch (error) {
    const { message, name } = <Error>error;
    logger.error(`Cognito.GetGroupCommandOutput: ${name}: ${message}`, {
      error,
      input,
    });
    throw error;
  }
};

export const groupExists = async (name: string): Promise<boolean> => {
  const output: GetGroupCommandOutput = await getGroup(name);
  return Boolean(output);
};
