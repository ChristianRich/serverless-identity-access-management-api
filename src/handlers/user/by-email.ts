import logger from 'src/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { getUserByEmail } from '@/services/dynamo/user';
import createError from 'http-errors';
import { User } from '@/types/user';
import { UserModel } from '@/models/user-model';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { email } = pathParameters;

  try {
    const user: User | null = await getUserByEmail(email);

    if (!user) {
      throw createError(404);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(new UserModel(user)),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error getting user by email: ${name} ${message}`, {
      data: email,
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
