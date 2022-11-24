import createError from 'http-errors';
import {
  AttributeType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { User, UserCreateInput } from '@/types/user';
import { collapseSpaces, getNanoId, toPascalCase } from '@/utils/string';
import logger from '@/services/logger';
import { COGNITO_USER_GROUP, DEFAULT_USER_AVATAR_URL } from '@/constants';
import { UserModel } from '@/models/user-model';
import { addUserToGroups } from '../cognito/groups/add-groups';
import { createUser as createCognitoUser } from '../cognito/create-user';
import { setPassword } from '../cognito/set-password';
import { createUser as createDynamoDbUser } from '../dynamo/user-table/create';

// Create Cognito user and link ID to DynamoDB partition key (foreign key)
export const registerUser = async (
  input: UserCreateInput,
): Promise<UserModel> => {
  logger.debug('Start user registration', { data: input }); // TODO Obfuscate PII in logs

  if (input.password !== input.repeatPassword) {
    throw createError(400, 'Password and repeat password must match');
  }

  const name = collapseSpaces(input.name, true);
  const email = collapseSpaces(input.email, true);

  const cognitoUser: UserType = await registerCognitoUser(
    email,
    name,
    input.password,
  );

  const id: string | undefined = getCognitoUserId(cognitoUser);
  const activationCode = getNanoId();

  const user: User = {
    id,
    createdAt: new Date().toISOString(),
    email,
    name,
    handle: `@${toPascalCase(name)}`,
    activationCode,
    sourceIp: input.sourceIp,
    role: 'USER',
    status: 'UNCONFIRMED',
    badges: ['NEW_MEMBER'],
    profileData: {
      avatarUrl: DEFAULT_USER_AVATAR_URL,
      lang: 'en_us',
      currency: 'USD',
    },
    data: {},
    sourceSystem: input.sourceSystem,
  };

  await createDynamoDbUser(user);

  logger.info('New user registration complete', {
    data: { user, cognitoUser },
  });

  return new UserModel(user);
};

// Create a new Cognito user and add to `USER` group
export const registerCognitoUser = async (
  email: string,
  name: string,
  password: string,
  group: COGNITO_USER_GROUP = COGNITO_USER_GROUP.USER,
): Promise<UserType> => {
  const user: UserType = await createCognitoUser(email, name);
  await setPassword(email, password);
  await addUserToGroups(email, [group]);
  return user;
};

// Extract UUID from newly minted Cognito user and pin to DynamodDB user record as PK
const getCognitoUserId = (user: UserType): string | undefined => {
  const { Attributes } = user;
  const sub: AttributeType | undefined = Attributes.find(
    (attr: AttributeType) => attr.Name === 'sub',
  );
  return sub?.Value;
};
