import logger from 'src/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { addBadge, removeBadge } from '@/services/dynamo/user-table/badge';
import createError from 'http-errors';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, requestContext } = event;
  const { id, name: badgeName } = pathParameters;
  const { httpMethod } = requestContext;

  let operation;

  if (httpMethod === 'POST') {
    operation = addBadge(id, badgeName);
  }

  if (httpMethod === 'DELETE') {
    operation = removeBadge(id, badgeName);
  }

  if (!operation) {
    throw createError(400, 'Unsupported request method');
  }

  try {
    const result: string[] = await operation;

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error issuing or revoking user badge: ${name} ${message}`, {
      data: { id, name },
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
