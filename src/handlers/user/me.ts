import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { getUserById } from '@/services/dynamo/user-table/get';
import { UserModel } from '@/models/user-model';
import { User } from '@/types/user';

// This handler is protected by a Cognito request authorizer and
// require a valid AWS Id Bearer token in the authorization header (issued at login)
const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const {
    requestContext: {
      authorizer: { claims },
    },
  } = event;

  logger.debug('Fetching logged user data', {
    data: {
      claims, // AWS IdToken claims
    },
  });

  const user: User | null = await getUserById(claims.sub);

  try {
    return {
      statusCode: 200,
      body: JSON.stringify(new UserModel(user)),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error fetching user: ${name} ${message}`);

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
