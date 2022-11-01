import {
  AttributeType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { User, UserCreateInput } from '@/types/user';
import { collapseSpaces, getRandomId, toPascalCase } from '@/utils/string';
import createError from 'http-errors';
import { addUserToGroups } from '../cognito/groups/add-groups';
import { createUser as createCognitoUser } from '../cognito/create-user';
import { setPassword } from '../cognito/set-password';
import logger from '../logger';
import { createUser as createDynamoDbUser } from '../dynamo/user';

// Create Cognito user and link ID to DynamoDB partition key
export const registerUser = async (input: UserCreateInput): Promise<User> => {
  logger.debug('Start user registration flow', { data: input });

  const name = collapseSpaces(input.name, true);
  const email = collapseSpaces(input.email, true);

  const cogniteUser: UserType = await registerCognitoUser(
    email,
    name,
    input.password,
  );

  const userId: string | undefined = getCognitoUUID(cogniteUser);

  if (!userId) {
    throw createError(500, 'Cognito did not return a sub/id');
  }

  const user: User = {
    id: userId,
    createdAt: new Date().toISOString(),
    email,
    name,
    handle: createHandle(name),
    activationCode: getRandomId(21),
    sourceIp: input.sourceIp,
    role: 'USER',
    status: 'UNCONFIRMED',
    badges: ['NEW_MEMBER'],
    bio: {},
    data: {},
  };

  await createDynamoDbUser(user);

  logger.info('User registration complete', {
    data: { user, cogniteUser },
  });

  return user;
};

export const registerCognitoUser = async (
  email: string,
  name: string,
  password: string,
  group = 'USER',
): Promise<UserType> => {
  const user: UserType = await createCognitoUser(email, name);
  await setPassword(email, password);
  await addUserToGroups(email, [group]);
  return user;
};

// Extract UUID from newly minted Cognito user and pin to DynamodDB record as partition key
const getCognitoUUID = (user: UserType): string | undefined => {
  const { Attributes } = user;
  const sub: AttributeType | undefined = Attributes.find(
    (attr: AttributeType) => attr.Name === 'sub',
  );
  return sub?.Value;
};

export const createHandle = (name: string): string => `@${toPascalCase(name)}`;
