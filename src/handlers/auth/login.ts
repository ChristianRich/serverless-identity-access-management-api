import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import logger from '@/services/logger';
import type { HttpError } from 'http-errors';
import {
  ValidatedAPIGatewayProxyEvent,
  ValidatedEventAPIGatewayProxyEvent,
} from '@/types/api-gateway';
import { middyfyWithRequestBody } from '@/middleware';
import { login } from '@/services/auth/login';

const requestBodyValidationSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 128 },
    password: { type: 'string', maxLength: 64 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

const baseHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof requestBodyValidationSchema
> = async (
  event: ValidatedAPIGatewayProxyEvent<typeof requestBodyValidationSchema>,
) => {
  const { email, password } = event.body;

  try {
    const tokens: AuthenticationResultType = await login(email, password);

    return {
      statusCode: 200,
      body: JSON.stringify(tokens), // TODO Consider which tokens to return
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;

    logger.error(`User authentication error ${name} ${message}`, {
      data: email,
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfyWithRequestBody(
  baseHandler,
  requestBodyValidationSchema,
);
