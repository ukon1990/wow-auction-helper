import type {ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {formatJSONResponse} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';

import schema from './schema';
import {NumberUtil} from "@shared/utils";

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const x = NumberUtil.format(1);
  return formatJSONResponse({
    message: `Hello ${event.body.name + x}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = middyfy(hello);