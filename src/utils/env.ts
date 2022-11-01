import { omitBy } from 'lodash';
import createError from 'http-errors';
import logger from '@/services/logger';
import { AppConfig } from '@/constants';

// Centralised point for accessing `process.env` variables
export const getConfig = (
  key: AppConfig,
  isRequired = true,
  fallbackValue?: string,
): string | undefined => {
  const value: string | undefined = process.env[String(key)];

  if (!value?.length) {
    const message = `Configuration error: '${key}' is required`;

    if (isRequired) {
      throw createError(500, message); // TODO integrate Middy error handler MW
    }
    logger.warn(
      `Configuration warning: Optional key '${key}' accessed, but not present in runtime config. Fallback value: ${fallbackValue}`,
    );
    return fallbackValue ?? undefined;
  }
  return value;
};

// serverless-offline plug-in
export const isOffline = (env: NodeJS.ProcessEnv = process.env): boolean =>
  env.IS_OFFLINE === 'true';

// Returns true when runtime environment is AWS Lambda
export const isAWS = (env: NodeJS.ProcessEnv = process.env): boolean =>
  'AWS_LAMBDA_FUNCTION_NAME' in env &&
  'LAMBDA_TASK_ROOT' in env &&
  !isOffline();

// *** SECURITY WARNING ***
export const getEnvVars = (
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> => omitBy(env, (_v, k) => k.startsWith('_npm'));
