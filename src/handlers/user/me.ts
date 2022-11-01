import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';

// This end-point is protected by a request authorizer and
// requires a valid AWS Id Bearer token in the authorization header (issued at login)
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

  try {
    return {
      statusCode: 200,
      body: JSON.stringify(claims),
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
