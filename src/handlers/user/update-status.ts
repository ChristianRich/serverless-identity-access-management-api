import logger from 'src/services/logger';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  UserStatus,
} from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { updateUserStatus } from '@/services/dynamo/user';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { id, status } = pathParameters;

  try {
    await updateUserStatus(id, <UserStatus>status);

    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error updating user status: ${name} ${message}`, {
      data: { id, status },
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
