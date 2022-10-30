import middy from '@middy/core';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import type { Logger } from '@aws-lambda-powertools/logger';

export const setLoggerContext = (
  logger: Logger,
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before = (request: middy.Request): void => {
    const { context }: { context: Context } = request;
    logger.addContext(context);
  };

  return {
    before,
  };
};
