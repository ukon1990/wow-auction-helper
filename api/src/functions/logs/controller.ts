import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {DatabaseUtil} from '../../utils/database.util';
import {LogService} from './log.service';
import {middyfy} from "@libs/lambda";
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {AuthService} from "../../shared/services/auth.service";

const connection = new DatabaseUtil(false, false);

export const getCurrentQueries = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();

  const service = new LogService(event, connection);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await service.getCurrentQueries()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});

export const getTableSize = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();
  // console.log(new AuthService(event.headers))

  const service = new LogService(event, connection);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await service.getCurrentQueries()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});

exports.getTableSize = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (!process.env.IS_OFFLINE) {
    Response.error(callback, new Error('Not authorized'), event, 401);
    return;
  }
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).getTableSize()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};

exports.getGlobalStatus = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (!process.env.IS_OFFLINE) {
    Response.error(callback, new Error('Not authorized'), event, 401);
    return;
  }
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).getGlobalStatus()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};

exports.processAccessLogs = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new LogService(event, new DatabaseUtil(false))
    .processAccessLogs()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};