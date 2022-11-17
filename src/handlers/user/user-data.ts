import logger from 'src/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfyWithRequestBody } from '@/middleware';
import {
  updateData,
  UpdateUserDataMode,
} from '@/services/dynamo/user-table/update-data';
import createError from 'http-errors';

const requestBodyValidationSchema = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as const;

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, body, requestContext } = event;
  const { id, status } = pathParameters;
  const { httpMethod } = requestContext;

  let mode: UpdateUserDataMode;

  if (httpMethod === 'PUT') {
    mode = 'OVERWRITE';
  }

  if (httpMethod === 'PATCH') {
    mode = 'MERGE';
  }

  if (!mode) {
    throw createError(400, `Invalid http method ${httpMethod}`);
  }

  // Receiving unstructured data
  const data: Record<string, unknown> = (body as unknown) as Record<
    string,
    unknown
  >;

  logger.debug('Update user data', { data, mode, httpMethod });

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
