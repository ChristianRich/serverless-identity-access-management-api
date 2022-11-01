import logger from 'src/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfyWithRequestBody } from '@/middleware';
import { updateData, UpdateUserDataMode } from '@/services/user/update-data';

const requestBodyValidationSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as const;

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, body, queryStringParameters } = event;
  const { id, status } = pathParameters;
  const { merge } = queryStringParameters;

  // Dodgy ..
  const data: Record<string, unknown> = body as unknown as Record<
    string,
    unknown
  >;

  const mode: UpdateUserDataMode = merge === '0' ? 'OVERWRITE' : 'MERGE';

  logger.debug('Update user data', { data, merge, queryStringParameters });

  try {
    await updateData(id, data, mode);

    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error updating user data: ${name} ${message}`, {
      data: { id, status },
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
