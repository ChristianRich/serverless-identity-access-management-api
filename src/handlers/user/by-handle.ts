import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { UserModel } from '@/models/user-model';
import { User } from '@/types/user';
import createError from 'http-errors';
import { getUserByHandle } from '@/services/dynamo/user-table/get';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { handle } = pathParameters;

  try {
    const user: User | null = await getUserByHandle(handle);

    if (!user) {
      throw createError(404);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(new UserModel(user)),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error getting user by handle: ${name} ${message}`, {
      data: handle,
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
