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
    const verificationResult = await verifyToken(token, tokenType);
    return {
      statusCode: 200,
      body: JSON.stringify(verificationResult),
    };
  } catch (error) {
    const { name, message, statusCode = 500 } = <Error | HttpError>error;
    logger.error(`Token validation error: ${name} ${message}`, {
      data: { token, tokenType },
    });

    return {
      statusCode,
      body: JSON.stringify(error),
    };
  }
};

export const handler = middyfy(baseHandler);
