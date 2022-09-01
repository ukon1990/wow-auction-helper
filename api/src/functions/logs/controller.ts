import {LogService} from './log.service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from '../../shared/services/auth.service';

export const getCurrentQueries = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();

  const service = new LogService(event);
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

  const service = new LogService(event);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await service.getTableSize()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});

export const getGlobalStatus = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();
  // console.log(new AuthService(event.headers))

  const service = new LogService(event);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await service.getGlobalStatus()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});

export const processAccessLogs = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new LogService(event);
  let response;

  await service.processAccessLogs()
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});