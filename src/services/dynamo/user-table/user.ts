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

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfig('AWS_REGION'),
});

export const updateUserData = async (
  id: string,
  data: Record<string, unknown>, // TODO use JSON type from npm type-fest
): Promise<void> => {
  const input: UpdateItemCommandInput = {
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
  };

  try {
    const command: UpdateItemCommand = new UpdateItemCommand(input);
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateUserData ${name}: ${message}`, { data: { input } });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }
    throw createError(500, 'Error updating user data');
  }
};

export const updateLastLoginTimeStamp = async (
  id: string,
  throwOnError = false,
): Promise<void> => {
  const input: UpdateItemCommandInput = {
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
  };

  try {
    const command: UpdateItemCommand = new UpdateItemCommand(input);
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateLastLoginTimeStamp ${name}: ${message}`, {
      data: { input },
    });

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

  try {
    const command: UpdateItemCommand = new UpdateItemCommand(input);
    logger.debug('updateUserStatus', { data: { input } });
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`updateUserStatus ${name}: ${message}`, { data: { input } });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

export const deleteActivationCode = async (
  id: string,
  throwOnError = false,
): Promise<void> => {
  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id }),
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'remove #activationCode',
    ExpressionAttributeNames: { '#activationCode': 'activationCode' },
  };
  try {
    const command = new UpdateItemCommand(input);
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`deleteActivationCode ${name}: ${message}`, {
      data: { input },
    });

    if (!throwOnError) {
      return;
    }

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

// TODO Soft delete by setting status to ARCHIVED
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
