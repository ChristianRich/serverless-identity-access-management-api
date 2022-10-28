import { UserType } from '@aws-sdk/client-cognito-identity-provider';
import { addUserToGroups } from '../cognito/groups/add-groups';
import { createUser } from '../cognito/create-user';
import { setPassword } from '../cognito/set-password';
import { createGroup } from '../cognito/groups/create-group';
import logger from '../logger';

export const registerUser = async (
  email: string,
  password: string,
): Promise<UserType> => {
  logger.info('Creating new user', { data: { email } });
  const user: UserType = await createUser(email);
  await setPassword(email, password);

  try {
    await createGroup('USERS');
    await addUserToGroups(email, ['USERS']);
  } catch (error) {
    //
  }

  // TODO DynamoDB flow
  return user;
};
