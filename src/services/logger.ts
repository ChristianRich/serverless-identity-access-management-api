import { Logger, LogFormatter } from '@aws-lambda-powertools/logger';
import {
  LogAttributes,
  UnformattedAttributes,
} from '@aws-lambda-powertools/logger/lib/types';
import { Context } from 'aws-lambda';
import { getConfigVariable, getNodeEnv, NODE_ENV } from 'src/utils/env';

type CustomLogFormat = LogAttributes;

class CustomLogFormatter extends LogFormatter {
  public formatAttributes(attributes: UnformattedAttributes): CustomLogFormat {
    return {
      logLevel: attributes.logLevel,
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
      timestamp: this.formatTimestamp(attributes.timestamp),
    };
  }
}

const logger: Logger = new Logger({
  logFormatter: new CustomLogFormatter(),
  logLevel: getConfigVariable(
    'LOG_LEVEL',
    false,
    getNodeEnv() === NODE_ENV.PRD ? 'INFO' : 'DEBUG',
  ),
  serviceName: getConfigVariable(
    'AWS_LAMBDA_FUNCTION_NAME',
    false,
    'localhost',
  ),
});

const getLogger = (): Logger => logger;

// TODO Inject context in @middy middleware
export const setContext = (context: Context): void =>
  getLogger().addContext(context);

export default getLogger();
