import {
  DeleteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import createError from 'http-errors';
import { getConfig } from '@/utils/env';
import logger from '@/services/logger';
import { UserStatus } from '@/types/user';
import { Config } from '@/constants';

// import AWS from '@aws-sdk/util-dynamodb';
// Docs
// Error types
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/dynamodbserviceexception.html

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfig('AWS_REGION'),
});

export const updateUserData = async (
  id: string,
  data: Record<string, unknown>,
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getConfig(Config.USERS_TABLE_NAME),
      Key: marshall({ id }),
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: 'SET #data = :data',
      ExpressionAttributeValues: marshall({
        ':data': data,
      }),
      ExpressionAttributeNames: {
        '#data': 'data',
      },
    });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateUserData ${name}: ${message}`);

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }
    throw createError(500, 'Error updating user data');
  }
};

export const updateLastLoginTimeStamp = async (
  id: string,
  throwOnError = false, // Option to suppress exceptions
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
    throw createError(500, 'Error updating lastLoginAt timestamp');
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
    TableName: getConfig(Config.USERS_TABLE_NAME),
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

// just use Array.from(set) // where set is the "badges" field contents

// https://medium.com/hackernoon/safe-list-updates-with-dynamodb-adc44f2e7d3
// export const toArrayfromSet = (set?: string[]): string[] => {
//   if (!set) {
//     return [];
//   }
//   if (Array.isArray(set)) {
//     return set;
//   }
//   const { values } = set;

//   if (!Array.isArray(values)) {
//     throw new Error(
//       'Invalid DocumentClient.DynamoDbSet: Type Array expected for values',
//     );
//   }
//   return <string[]>values;
// };

// export const fromArrayToSet = (
//   values: string[],
// ): DocumentClient.DynamoDbSet => {
//   if (!values?.length) {
//     throw Error('Cannot convert empty array into DocumentClient.DynamoDbSet');
//   }
//   return documentClient.createSet(values);
// };
