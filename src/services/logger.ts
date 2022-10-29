import { Logger, LogFormatter } from '@aws-lambda-powertools/logger';
import {
  LogAttributes,
  UnformattedAttributes,
} from '@aws-lambda-powertools/logger/lib/types';
import { Context } from 'aws-lambda';

type CustomLogFormat = LogAttributes;

export const logformatAWS = (
  attributes: UnformattedAttributes,
  timestamp: string,
): CustomLogFormat => ({
  level: attributes.logLevel,
  message: attributes.message,
  service: attributes.serviceName,
  environment: attributes.environment,
  awsRegion: attributes.awsRegion,
  correlationIds: {
    awsRequestId: attributes.lambdaContext?.awsRequestId,
    xRayTraceId: attributes.xRayTraceId,
  },
  lambdaFunction: {
    name: attributes.lambdaContext?.functionName,
    arn: attributes.lambdaContext?.invokedFunctionArn,
    memoryLimitInMB: attributes.lambdaContext?.memoryLimitInMB,
    version: attributes.lambdaContext?.functionVersion,
    coldStart: attributes.lambdaContext?.coldStart,
  },
  timestamp,
});

export const logformatLocal = (
  attributes: UnformattedAttributes,
): CustomLogFormat => ({ message: attributes.message });
class CustomLogFormatter extends LogFormatter {
  public formatAttributes(attributes: UnformattedAttributes): CustomLogFormat {
    const timestamp = this.formatTimestamp(attributes.timestamp);

    // Simplied logs for localhost development when using serverless-offline plug-in
    return process.env.IS_OFFLINE === 'true'
      ? logformatLocal(attributes)
      : logformatAWS(attributes, timestamp);
  }
}

const logger: Logger = new Logger({
  logFormatter: new CustomLogFormatter(),
  logLevel: process.env.LOG_LEVEL || 'DEBUG',
  serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME,
});

const getLogger = (): Logger => logger;

export const setContext = (context: Context): void =>
  getLogger().addContext(context);

export default getLogger();
