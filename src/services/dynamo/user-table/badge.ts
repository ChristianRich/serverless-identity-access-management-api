import {
  DynamoDBClient,
  UpdateItemCommand,
  AttributeValue,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, convertToAttr, unmarshall } from '@aws-sdk/util-dynamodb';
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
): Promise<string[]> => {
  const attributeValue: AttributeValue = convertToAttr([name]);

  if (await hasBadge(id, name as UserBadgeName)) {
    throw createError(400, `Badge '${name}' already issued to user ${id}`);
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

  const command = new UpdateItemCommand(input);

  try {
    logger.debug('addBadge', { data: input, attributeValue });
    const output: UpdateItemCommandOutput = await client.send(command);

    const user: User = <User>unmarshall(output.Attributes);
    const { badges: newValues }: { badges: UserBadgeName[] } = user;
    return <string[]>newValues;
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`Error adding badge ${name}: ${message}`, {
      data: '',
    });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, 'Error updating user data');
  }
};

export const removeBadge = async (
  id: string,
  name: UserBadgeName | string,
): Promise<string[]> => {
  const badges: string[] = await getBadges(id);
  const idx = badges.indexOf(name);

  if (idx === -1) {
    throw createError(
      404,
      `Error revoking badge '${name}': Not issued to user ${id}`,
    );
  }

  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id }),
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: `REMOVE badges[${idx}]`,
    ReturnValues: 'ALL_NEW',
  };

  try {
    logger.debug('removeBadge', { data: input, idx, name });

    const command = new UpdateItemCommand(input);
    const output: UpdateItemCommandOutput = await client.send(command);

    const user: User = <User>unmarshall(output.Attributes);
    const { badges: newValues }: { badges: UserBadgeName[] } = user;
    return <string[]>newValues;
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

export const getBadges = async (id: string): Promise<string[]> => {
  const user: User | null = await getUserById(id);

  if (!user) {
    throw createError(404);
  }

  return user.badges as string[];
};
