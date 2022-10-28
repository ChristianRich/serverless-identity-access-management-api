import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import logger from 'src/services/logger';
import { Context } from 'aws-lambda';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import errorHandler from '@schibsted/middy-error-handler';
import {
  ValidatedAPIGatewayProxyEvent,
  ValidatedEventAPIGatewayProxyEvent,
} from '@/types/api-gateway';
import { jsonSchemaBodyValidator } from '@/middleware/json-schema-body-validator';
import { getNodeEnv, NODE_ENV } from '@/utils/env';
import { auth } from '@/services/cognito/auth';

const requestBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', minLength: 6, maxLength: 128 },
    password: { type: 'string', minLength: 6, maxLength: 64 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

const baseHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof requestBodySchema
> = async (
  event: ValidatedAPIGatewayProxyEvent<typeof requestBodySchema>,
  context: Context,
) => {
  logger.addContext(context);

  try {
    const { email, password } = event.body;
    const authenticationResult: AuthenticationResultType = await auth(
      email,
      password,
    );

    return {
      statusCode: 200,
      body: JSON.stringify(authenticationResult),
    };
  } catch (error) {
    const { message } = <Error>error;
    logger.error(`Error authenticating in user: ${message}`);

    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middy(baseHandler)
  .use(httpHeaderNormalizer())
  .use(middyJsonBodyParser())
  .use(jsonSchemaBodyValidator(requestBodySchema))
  .use(httpSecurityHeaders())
  .use(errorHandler({ exposeStackTrace: getNodeEnv() !== NODE_ENV.PRD }));
