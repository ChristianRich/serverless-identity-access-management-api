import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import type { User } from '@/types/user';
import createError from 'http-errors';
import { UserModel } from '@/models/user-model';
import { getUserById } from '@/services/dynamo/user-table/get';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { id } = pathParameters;

  try {
    const user: User | null = await getUserById(id);

    if (!user) {
      throw createError(404);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(new UserModel(user)),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error getting user by id: ${name} ${message}`, { data: id });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
