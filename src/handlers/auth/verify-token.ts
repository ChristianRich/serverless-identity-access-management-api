import logger from '@/services/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { HttpError } from 'http-errors';
import { middyfy } from '@/middleware';
import { verifyToken } from '@/services/auth/verify-token';
import createError from 'http-errors';

const baseHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters } = event;
  const { tokenType, token } = pathParameters;

  if (tokenType !== 'access' && tokenType !== 'id') {
    throw createError(
      400,
      `Invalid token type ${tokenType}: 'access' or 'id' expected`,
    );
  }

  try {
    await verifyToken(token, tokenType);
    return {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    const { name, message } = <Error | HttpError>error;
    logger.error(`Token validation error: ${name} ${message}`, {
      data: { token, tokenType },
    });

    throw error;
  }
};

export const handler = middyfy(baseHandler);
