import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import createError from 'http-errors';
import { getConfig } from '@/utils/env';
import logger from '@/services/logger';
import { User } from '@/types/user';
import { Config } from '@/constants';

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfig('AWS_REGION'),
});

export const getUserById = async (id: string): Promise<User | null> => {
  const input: QueryCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    KeyConditionExpression: '#id = :s',
    ExpressionAttributeValues: marshall({
      ':s': id,
    }),
    ExpressionAttributeNames: {
      '#id': 'id',
    },
  };

  try {
    const command = new QueryCommand(input);
    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserById ${name}: ${message}`, { data: { input } });
    throw createError(500, 'Error getting user by id');
  }
};

export const getUserByName = async (name: string): Promise<User | null> => {
  const input: QueryCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    IndexName: 'NameIndex',
    KeyConditionExpression: '#name = :s',
    ExpressionAttributeValues: marshall({
      ':s': name,
    }),
    ExpressionAttributeNames: {
      '#name': 'name',
    },
  };

  try {
    const command: QueryCommand = new QueryCommand(input);
    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByName ${name}: ${message}`, { data: { input } });
    throw createError(500, 'Error getting user by name');
  }
};

export const getUserByHandle = async (handle: string): Promise<User | null> => {
  const input: QueryCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    IndexName: 'HandleIndex',
    KeyConditionExpression: 'handle = :s',
    ExpressionAttributeValues: marshall({
      ':s': handle,
    }),
  };

  try {
    const command: QueryCommand = new QueryCommand(input);
    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByEmail ${name}: ${message}`, { data: { input } });
    throw createError(500, 'Error getting user by handle');
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const input: QueryCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :s',
    ExpressionAttributeValues: marshall({
      ':s': email,
    }),
  };

  try {
    const command: QueryCommand = new QueryCommand(input);
    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByEmail ${name}: ${message}`, { data: { input } });
    throw createError(500, 'Error getting user by email');
  }
};

export const getUserByActivationCode = async (
  activationCode: string,
): Promise<User | null> => {
  const input: QueryCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    IndexName: 'ActivationCodeIndex',
    KeyConditionExpression: 'activationCode = :s',
    ExpressionAttributeValues: marshall({
      ':s': activationCode,
    }),
  };

  try {
    const command: QueryCommand = new QueryCommand(input);
    const data: QueryCommandOutput = await client.send(command);
    const { Items } = data;

    if (!Items?.length) {
      return null;
    }
    return <User>unmarshall(Items[0]);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`getUserByActivationCode ${name}: ${message}`, {
      data: { input },
    });
    throw createError(500, 'Error getting user by activation code');
  }
};
