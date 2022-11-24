import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';
import logger from '@/services/logger';
import type { HttpError } from 'http-errors';
import {
  ValidatedAPIGatewayProxyEvent,
  ValidatedEventAPIGatewayProxyEvent,
} from '@/types/api-gateway';
import { auth } from '@/services/cognito/auth';
import { middyfyWithRequestBody } from '@/middleware';
import { updateLastLoginTimeStamp } from '@/services/dynamo/user-table/user';
import {
  CognitoAccessTokenPayload,
  CognitoIdOrAccessTokenPayload,
  CognitoIdTokenPayload,
} from 'aws-jwt-verify/jwt-model';
import { verifyToken } from '@/services/auth/verify-token';

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
    const authenticationResult: AuthenticationResultType = await auth(
      email,
      password,
    );

    const { AccessToken } = authenticationResult;

    // Pulling out the claims to get the userId
    const claims: CognitoIdOrAccessTokenPayload<
      CognitoIdTokenPayload,
      CognitoAccessTokenPayload
    > = await verifyToken(AccessToken);

    await updateLastLoginTimeStamp(claims.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(authenticationResult),
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
