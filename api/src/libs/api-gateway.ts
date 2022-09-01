import type {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from 'aws-lambda'
import type {FromSchema} from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> };
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

export const isOffline = (process.env.IS_OFFLINE || process.env.IS_LOCAL) || process.env.NODE_ENV === 'test';

export const cors = {
  origin: isOffline ? 'localhost:4200' : 'https://wah.jonaskf.net'
};

const headers = {
  'Access-Control-Allow-Origin': cors.origin,
  // 'Access-Control-Allow-Headers': 'application/json',
  // 'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PATCH'
};
export const formatErrorResponse = (
  statusCode: number,
  message: string,
  error?: Error
) => {
  console.error(error);
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      statusCode,
      message,
    })
  };
};

export const formatJSONResponse = (response?: Record<string, unknown>, customHeaders = {}) => {
  const result = {
    headers: {
      ...headers,
      ...customHeaders,
    },
    statusCode: 200,
  };

  if (response) {
    result['body'] = response && typeof response === 'object' ? JSON.stringify(response) : response;
  }

  return result;
};