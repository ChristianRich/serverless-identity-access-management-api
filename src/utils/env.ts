import path from 'path';
import { omitBy } from 'lodash';
import createError from 'http-errors';

// eslint-disable-next-line no-shadow
export enum NODE_ENV {
  DEV = 'dev',
  TST = 'tst',
  UAT = 'uat',
  STG = 'stg',
  PRD = 'prd',
}

/**
 * Centralised point for accessing `process.env` variables
 */
export const getConfigVariable = (
  key: string,
  isRequired = true,
  fallbackValue?: string,
): string | undefined => {
  const value: string | undefined = process.env[key.trim()];

  if (!value?.length) {
    const message = `Configuration error: '${key}' required`;

    if (isRequired) {
      throw createError(500, message); // TODO integrate Middy error handler MW
    }
    // eslint-disable-next-line no-console
    console.warn(
      `Configuration warning: Optional key '${key}' accessed, but not present in runtime config. Fallback value: ${fallbackValue}`,
    );
    return fallbackValue ?? undefined;
  }
  return value;
};

/**
 *  Returns true if runtime environment is AWS Lambda
 */
export const isAWS = (env: NodeJS.ProcessEnv = process.env): boolean =>
  'AWS_LAMBDA_FUNCTION_NAME' in env || 'LAMBDA_TASK_ROOT' in env;

/**
 *  Assume localhost if not AWS.
 */
export const isLocalhost = (env: NodeJS.ProcessEnv = process.env): boolean =>
  !isAWS(env);

/**
 * Return the Node runtime env
 */
export const getNodeEnv = (
  env: NodeJS.ProcessEnv = process.env,
): string | undefined => env.NODE_ENV;

/**
 * *** SECURITY WARNING ***
 * Return all process.env variables omitting keys beginning with `npm_`
 * Useful for dev debugging (non-prd only)
 */
export const printEnvVars = (
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> =>
  getNodeEnv() !== NODE_ENV.PRD
    ? <Record<string, string>>omitBy(env, (_v, k) => k.startsWith('_npm'))
    : {};

/**
 * Resolves the base path for either AWS and localhost respectively
 * Useful when interacting with the file system
 */
export const resolveBasePath = (subPath = ''): string =>
  isAWS()
    ? path.join(<string>process.env.LAMBDA_TASK_ROOT, subPath)
    : path.join(process.cwd(), subPath);
