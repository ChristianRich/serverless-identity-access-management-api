import { UserType } from '@aws-sdk/client-cognito-identity-provider';
import { registerUser } from 'src/services/user/register-user';
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

const requestBodySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 5,
      maxLength: 32,
      pattern: '^[-_.a-zA-Z0-9]+$',
    },
    email: { type: 'string', format: 'email', minLength: 6, maxLength: 128 },
    password: { type: 'string', minLength: 6, maxLength: 64 },
    repeatPassword: { type: 'string', minLength: 6, maxLength: 64 },
    'bio.avatarUrl': { type: 'string', format: 'uri' },
    'bio.about': { type: 'string', maxLength: 200 },
    'bio.location': { type: 'string', maxLength: 20 },
  },
  required: ['name', 'email', 'password', 'repeatPassword'],
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
    const user: UserType = await registerUser(email, password);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    const { message } = <Error>error;
    logger.error(`User registration error: ${message}`);

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
