import type { ListUsersCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
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
import { getNodeEnv, NODE_ENV } from '@/utils/env';
import { listUsers } from '@/services/cognito/list';

const baseHandler = async (
  _event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.addContext(context);

  try {
    const users: ListUsersCommandOutput = await listUsers();

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (error) {
    const { message } = <Error>error;
    logger.error(`Error logging in user: ${message}`);

    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middy(baseHandler)
  .use(httpHeaderNormalizer())
  .use(httpSecurityHeaders())
  .use(errorHandler({ exposeStackTrace: getNodeEnv() !== NODE_ENV.PRD }));
