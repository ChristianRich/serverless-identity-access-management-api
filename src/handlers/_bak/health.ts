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
import { getConfig, getEnvVars } from '@/utils/env';

const baseHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.addContext(context);

  logger.info('Log test INFO', { data: 'some-data' });
  logger.debug('Log test DEBUG');
  logger.warn('Log test WARN');
  logger.error('Log test ERROR');

  // Should produce a warning
  getConfig('FOO', false);

  return {
    statusCode: 200,
    body: JSON.stringify({
      'process.env': getEnvVars(),
      event,
      context,
    }),
  };
};

export const handler = middy(baseHandler)
  .use(httpHeaderNormalizer())
  .use(httpSecurityHeaders())
  .use(errorHandler({ exposeStackTrace: true }));
