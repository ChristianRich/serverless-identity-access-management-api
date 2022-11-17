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

// Add a new badge to a user and return a list of badges
export const addBadge = async (
  userId: string,
  badgeName: UserBadgeName,
): Promise<UserBadgeName[]> => {
  const attributeValue: AttributeValue = convertToAttr([badgeName]);

  if (await hasBadge(userId, badgeName)) {
    throw createError(
      400,
      `Badge '${badgeName}' already issued to user ${userId}`,
    );
  }

  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id: userId }),
    UpdateExpression:
      'SET badges = list_append(if_not_exists(badges, :empty_list), :new_value)',
    ExpressionAttributeValues: {
      ':new_value': attributeValue,
      ':empty_list': convertToAttr([]),
    },
    ReturnValues: 'ALL_NEW',
  };

  logger.debug('addBadge', { data: input, attributeValue });

  const command: UpdateItemCommand = new UpdateItemCommand(input);

  try {
    const output: UpdateItemCommandOutput = await client.send(command);

    const user: User = <User>unmarshall(output.Attributes);
    const { badges: newValues }: { badges: UserBadgeName[] } = user;
    return newValues;
  } catch (error) {
    const { name, message } = <Error>error;
    logger.error(`Error adding badge ${name}: ${message}`, {
      data: { input },
    });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404);
    }

    throw createError(500, `Error issuing badge ${badgeName}`);
  }
};

export const removeBadge = async (
  userId: string,
  badgeName: UserBadgeName,
): Promise<UserBadgeName[]> => {
  const badges: string[] = await getBadges(userId);
  const idx: number = badges.indexOf(badgeName);

  if (idx === -1) {
    throw createError(
      404,
      `Error revoking badge '${badgeName}': Not issued to user ${userId}`,
    );
  }

  const input: UpdateItemCommandInput = {
    TableName: getConfig(Config.USERS_TABLE_NAME),
    Key: marshall({ id: userId }),
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: `REMOVE badges[${idx}]`,
    ReturnValues: 'ALL_NEW',
  };

  try {
    logger.debug(`Revoking user badge ${badgeName} for user ${userId}`, {
      data: { input },
    });
    const command = new UpdateItemCommand(input);
    const output: UpdateItemCommandOutput = await client.send(command);
    const user: User = <User>unmarshall(output.Attributes);
    const { badges: newValues }: { badges: UserBadgeName[] } = user;
    return newValues;
  } catch (error) {
    const { name, message } = <Error>error;
    const errorMessage = `Error revoking user badge ${name} ${message}`;

    logger.error(errorMessage, { data: { input } });

    if (name === 'ConditionalCheckFailedException') {
      throw createError(404, `Badge not found ${badgeName}`);
    }

    throw createError(500, errorMessage);
  }
};

export const hasBadge = async (
  userId: string,
  badgeName: UserBadgeName,
): Promise<boolean> => {
  const user: User | null = await getUserById(userId);

  if (!user) {
    throw createError(404);
  }

  const { badges }: { badges: UserBadgeName[] } = user;
  return badges?.length && badges.includes(badgeName);
};

export const getBadges = async (userId: string): Promise<UserBadgeName[]> => {
  const user: User | null = await getUserById(userId);

  if (!user) {
    throw createError(404, `User not found ${userId}`);
  }

  return user.badges;
};
