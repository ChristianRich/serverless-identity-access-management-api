import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createError from 'http-errors';
import { getConfigVariable } from 'src/utils/env';
import logger from 'src/services/logger';

// Docs
// Error types
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/dynamodbserviceexception.html

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfigVariable('AWS_REGION'),
});

// const documentClient: DocumentClient = new DocumentClient();
const getTableName = (): string =>
  <string>getConfigVariable('USERS_TABLE_NAME');

type User = {
  id: string;
};

type UserStatus = 'FOO' | 'BAR';

export const createUser = async (user: User): Promise<void> => {
  const command = new PutItemCommand({
    TableName: getTableName(),
    Item: marshall(user),
    ConditionExpression: 'attribute_not_exists(id)',
  });

  try {
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;

    if (name === 'ConditionalCheckFailedException') {
      throw createError(400, `User id ${user.id} already exists`);
    }

    logger.error(`createUser ${name}: ${message}`);
    throw createError(500, {
      detail: 'An error occurred during account registration', // TODO get rid of detail and use message property
    });
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const command = new GetItemCommand({
      TableName: getTableName(),
      Key: marshall({ id }),
    });

    const data: GetItemCommandOutput = await client.send(command);
    const { Item } = data;
    return Item ? <User>unmarshall(Item) : null;
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserById ${name}: ${message}`);

    throw createError(500, {
      detail: 'We encountered an error retrieving the user profile',
    });
  }
};

export const getUserByName = async (name: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getTableName(),
      IndexName: 'NameIndex',
      KeyConditionExpression: '#name = :s',
      ExpressionAttributeValues: marshall({
        ':s': name,
      }),
      ExpressionAttributeNames: {
        '#name': 'name',
      },
    });

    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;

    logger.error(`getUserByName ${name}: ${message}`);
    throw createError(500, {
      detail: 'We encountered an error retrieving the user profile',
    });
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getTableName(),
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :s',
      ExpressionAttributeValues: marshall({
        ':s': email,
      }),
    });

    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByName ${name}: ${message}`);

    throw createError(500, {
      detail: 'We encountered an error retrieving the user profile',
    });
  }
};

export const getUserByActivationCode = async (
  activationCode: string,
): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getTableName(),
      IndexName: 'ActivationCodeIndex',
      KeyConditionExpression: 'activationCode = :s',
      ExpressionAttributeValues: marshall({
        ':s': activationCode,
      }),
    });

    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByActivationCode ${name}: ${message}`);

    throw createError(500, {
      detail: 'We encountered an error during account activation',
    });
  }
};

export const updateLastLoginTimeStamp = async (
  id: string,
  throwOnError = false, // Option to suppress exceptions
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getTableName(),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'SET #lastLoginAt = :lastLoginAt',
      ExpressionAttributeValues: marshall({
        ':lastLoginAt': new Date().toISOString(),
      }),
      ExpressionAttributeNames: {
        '#lastLoginAt': 'lastLoginAt',
      },
    });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateLastLoginTimeStamp ${name}: ${message}`);

    if (!throwOnError) {
      return;
    }
    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }
    throw createError(500, {
      detail: 'We encountered an error during login',
    });
  }
};

export const updateUserStatus = async (
  id: string,
  userStatus: UserStatus,
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getTableName(),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeValues: marshall({
        ':status': userStatus,
      }),
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateUserStatus ${name}: ${message}`);

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, {
      detail: 'We encountered an error during account activation',
    });
  }
};

/**
 * Delete the activationCode from the user record subsequent to account activation
 * @param id
 * @param throwOnError Suppress exceptions from propagating
 */
export const deleteActivationCode = async (
  id: string,
  throwOnError = false,
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getTableName(),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'remove #activationCode',
      ExpressionAttributeNames: { '#activationCode': 'activationCode' },
    });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`DynamoDB.UpdateItemCommand ${name}: ${message}`);

    if (!throwOnError) {
      return;
    }

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, {
      detail: 'We encountered an error during account activation',
    });
  }
};

export const deleteUser = async (
  id: string,
  throwOnError = false,
): Promise<void> => {
  const command: DeleteItemCommand = new DeleteItemCommand({
    TableName: getTableName(),
    Key: marshall({ id }),
    ConditionExpression: 'attribute_exists(id)',
  });

  try {
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`deleteUser ${name}: ${message}`);

    if (!throwOnError) {
      return;
    }

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, {
      detail: `Error deleting user ${id}`,
    });
  }
};

// https://medium.com/hackernoon/safe-list-updates-with-dynamodb-adc44f2e7d3
export const toArrayfromSet = (set?: string[]): string[] => {
  if (!set) {
    return [];
  }
  if (Array.isArray(set)) {
    return set;
  }
  const { values } = set;

  if (!Array.isArray(values)) {
    throw new Error(
      'Invalid DocumentClient.DynamoDbSet: Type Array expected for values',
    );
  }
  return <string[]>values;
};

// export const fromArrayToSet = (
//   values: string[],
// ): DocumentClient.DynamoDbSet => {
//   if (!values?.length) {
//     throw Error('Cannot convert empty array into DocumentClient.DynamoDbSet');
//   }
//   return documentClient.createSet(values);
// };
