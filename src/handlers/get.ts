import logger from 'src/services/logger';
import type {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import errorHandler from '@schibsted/middy-error-handler';
import type { HttpError } from 'http-errors';
import { getUserById } from '@/services/user/get';

const baseHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.addContext(context);
  const { pathParameters } = event;
  const { id } = pathParameters;

  try {
    const user = await getUserById(id);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error getting list of Cognito users: ${name} ${message}`);

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middy(baseHandler)
  .use(httpHeaderNormalizer())
  .use(httpSecurityHeaders())
  .use(errorHandler({ exposeStackTrace: process.env.NODE_ENV !== 'prd' }));
