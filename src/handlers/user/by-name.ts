import logger from '@/services/logger';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { UserModel } from '@/models/user-model';
import { User } from '@/types/user';
import createError from 'http-errors';
import { getUserByName } from '@/services/dynamo/user-table/get';

const baseHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { name } = pathParameters;

  try {
    const user: User | null = await getUserByName(name);

    if (!user) {
      throw createError(400);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(new UserModel(user)),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error getting user by name: ${name} ${message}`, {
      data: name,
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
