import { registerUser } from 'src/services/user/register-user';
import logger from '@/services/logger';
import type {
  ValidatedAPIGatewayProxyEvent,
  ValidatedEventAPIGatewayProxyEvent,
} from '@/types/api-gateway';
import type { HttpError } from 'http-errors';
import { middyfyWithRequestBody } from '@/middleware';
import type { User, UserCreateInput } from '../../types/user';

const requestBodyValidationSchema = {
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
  typeof requestBodyValidationSchema
> = async (
  event: ValidatedAPIGatewayProxyEvent<typeof requestBodyValidationSchema>,
) => {
  const { body, requestContext } = event;

  // Map unsafe user input to type-safe transfer model
  const userCreateInput: UserCreateInput = {
    name: body.name,
    email: body.email,
    password: body.password,
    repeatPassword: body.repeatPassword,
    sourceIp: requestContext.identity.sourceIp,
    'bio.avatarUrl': body['bio.avatarUrl'],
    'bio.about': body['bio.about'],
    'bio.location': body['bio.location'],
  };

  try {
    const user: User = await registerUser(userCreateInput);
    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`User registration error: ${statusCode} ${name}: ${message}`);

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
