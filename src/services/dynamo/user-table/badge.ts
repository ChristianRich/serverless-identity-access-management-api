import {
  DynamoDBClient,
  UpdateItemCommand,
  AttributeValue,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, convertToAttr } from '@aws-sdk/util-dynamodb';
import createError from 'http-errors';
import { getConfig } from '@/utils/env';
import logger from '@/services/logger';
import { Config } from '@/constants';
import { User, UserBadgeName } from '@/types/user';
import { getUserById } from './get';

const client: DynamoDBClient = new DynamoDBClient({
  region: getConfig('AWS_REGION'),
});

export const addBadge = async (
  id: string,
  name: UserBadgeName | string,
): Promise<void> => {
  const attributeValue: AttributeValue = convertToAttr([name]);

  if (await hasBadge(id, name as UserBadgeName)) {
    return;
  }

  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id }),
    UpdateExpression:
      'SET badges = list_append(if_not_exists(badges, :empty_list), :new_value)',
    ExpressionAttributeValues: {
      ':new_value': attributeValue,
      ':empty_list': convertToAttr([]),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    logger.debug('UpdateItemCommandInput', { data: input, attributeValue });

    const command = new UpdateItemCommand(input);
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`Error updating user badges ${name}: ${message}`, {
      data: '',
    });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

// TODO
export const removeBadge = async (
  id: string,
  name: UserBadgeName | string,
): Promise<void> => {
  const attributeValue: AttributeValue = convertToAttr([name]);
  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id }),
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET #badges = :badges',
    ExpressionAttributeValues: {
      ':badges': attributeValue,
    },
    ExpressionAttributeNames: { '#badges': 'badges' },
  };

  try {
    logger.debug('UpdateItemCommandInput', { data: input, attributeValue });

    const command = new UpdateItemCommand(input);
    await client.send(command);
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`Error updating user badges ${name}: ${message}`, {
      data: '',
    });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

export const hasBadge = async (
  id: string,
  badge: UserBadgeName,
): Promise<boolean> => {
  const user: User | null = await getUserById(id);

  if (!user) {
    throw createError(404);
  }

  const { badges }: { badges: UserBadgeName[] } = user;
  return badges?.length && badges.includes(badge);
};
