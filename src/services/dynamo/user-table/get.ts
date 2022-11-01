import {
  DynamoDBClient,
  QueryCommand,
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
  try {
    const command = new QueryCommand({
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
      TableName: getConfig(Config.USERS_TABLE_NAME),
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
