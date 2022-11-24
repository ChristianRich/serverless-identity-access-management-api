import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { deleteUser } from '@/services/user/delete';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { id } = pathParameters;

  try {
    await deleteUser(id);

    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error deleting user: ${name} ${message}`, {
      data: id,
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
