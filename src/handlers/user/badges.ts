import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import createError from 'http-errors';
import logger from 'src/services/logger';
import { middyfy } from '@/middleware';
import { addBadge, removeBadge } from '@/services/dynamo/user-table/badge';
import { UserBadgeName } from '@/types/user';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, requestContext } = event;
  const { id, name: badgeName } = pathParameters;
  const { httpMethod } = requestContext;

  let operation;

  if (httpMethod === 'POST') {
    operation = addBadge(id, <UserBadgeName>badgeName);
  }

  if (httpMethod === 'DELETE') {
    operation = removeBadge(id, <UserBadgeName>badgeName);
  }

  if (!operation) {
    throw createError(
      400,
      `Operation not found: Unsupported request method ${httpMethod}`,
    );
  }

  try {
    const result: UserBadgeName[] = await operation;

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Error issuing or revoking user badge: ${name} ${message}`, {
      data: { id, badgeName },
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
