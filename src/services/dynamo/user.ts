import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createError from 'http-errors';
import { getConfig } from '@/utils/env';
import logger from '@/services/logger';
import { User, UserStatus } from '@/types/user';

// Docs
// Error types
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/dynamodbserviceexception.html

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfig('AWS_REGION'),
});

export const createUser = async (user: User): Promise<void> => {
  const command = new PutItemCommand({
    TableName: getConfig('USERS_TABLE_NAME'),
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
    throw createError(500, 'User registration error');
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
      KeyConditionExpression: '#id = :s',
      ExpressionAttributeValues: marshall({
        ':s': id,
      }),
      ExpressionAttributeNames: {
        '#id': 'id',
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
    logger.error(`getUserById ${name}: ${message}`);
    throw createError(500, 'Error getting user by id');
  }
};

export const getUserByName = async (name: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
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
    throw createError(500, 'Error fetching user profile');
  }
};

export const getUserByHandle = async (handle: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
      IndexName: 'HandleIndex',
      KeyConditionExpression: 'handle = :s',
      ExpressionAttributeValues: marshall({
        ':s': handle,
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
    logger.error(`getUserByEmail ${name}: ${message}`);
    throw createError(500, 'Error fetching user profile');
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
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
    logger.error(`getUserByEmail ${name}: ${message}`);
    throw createError(500, 'Error fetching user profile');
  }
};

export const getUserByActivationCode = async (
  activationCode: string,
): Promise<User | null> => {
  try {
    const command = new QueryCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
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
    throw createError(500, 'Error getting user from activation code');
  }
};

export const updateLastLoginTimeStamp = async (
  id: string,
  throwOnError = false, // Option to suppress exceptions
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getConfig('USERS_TABLE_NAME'),
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
    throw createError(500, 'Error updating user data');
  }
};

export const updateUserStatus = async (
  id: string,
  userStatus: UserStatus,
): Promise<void> => {
  if (
    ![
      'UNCONFIRMED',
      'CONFIRMED',
      'ARCHIVED',
      'COMPROMISED',
      'SUSPENDED',
      'UNKNOWN',
      'RESET_REQUIRED',
      'FORCE_CHANGE_PASSWORD',
    ].includes(String(userStatus).toUpperCase())
  ) {
    throw createError(400, `Invalid userStatus ${userStatus}`);
  }

  try {
    const input: UpdateItemCommandInput = {
      TableName: getConfig('USERS_TABLE_NAME'),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeValues: marshall({
        ':status': userStatus.toUpperCase(),
      }),
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    };

    const command = new UpdateItemCommand(input);
    logger.debug('updateUserStatus', { data: { input, id, userStatus } });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateUserStatus ${name}: ${message}`);

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
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
      TableName: getConfig('USERS_TABLE_NAME'),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'remove #activationCode',
      ExpressionAttributeNames: { '#activationCode': 'activationCode' },
    });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`deleteActivationCode ${name}: ${message}`);

    if (!throwOnError) {
      return;
    }

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

export const deleteUser = async (
  id: string,
  throwOnError = false,
): Promise<void> => {
  const command: DeleteItemCommand = new DeleteItemCommand({
    TableName: getConfig('USERS_TABLE_NAME'),
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

    throw createError(500, `Error deleting user ${id}`);
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
