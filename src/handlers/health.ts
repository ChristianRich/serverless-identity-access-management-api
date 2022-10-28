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
import { getNodeEnv, NODE_ENV, printEnvVars } from '@/utils/env';

const baseHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.addContext(context);

  return {
    statusCode: 200,
    body: JSON.stringify({
      nodeEnv: getNodeEnv() || 'local',
      envVars: printEnvVars(),
      event,
      context,
    }),
  };
};

export const handler = middy(baseHandler)
  .use(httpHeaderNormalizer())
  .use(httpSecurityHeaders())
  .use(errorHandler({ exposeStackTrace: getNodeEnv() !== NODE_ENV.PRD }));
