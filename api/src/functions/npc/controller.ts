import {NpcHandler} from '../handlers/npc.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from '../../shared/services/auth.service';

export const addNewNPCsByIds = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();
  const db = new DatabaseUtil(false);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await NpcHandler.addNewNPCsByIds(JSON.parse(event.body).ids, db)
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err))
      .finally(() => db.end());
  }

  return response;
});

export const getAll = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();
  const {locale, timestamp} = JSON.parse(event.body);
  const db = new DatabaseUtil(false);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await NpcHandler.getAll(locale, timestamp)
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err))
      .finally(() => db.end());
  }

  return response;
});

export const getById = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isAdmin = await new AuthService(event.headers).isAdmin();
  const db = new DatabaseUtil(false);
  let response;

  if (!isAdmin) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await NpcHandler.getById(+event.pathParameters.id, JSON.parse(event.body).locale)
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err))
      .finally(() => db.end());
  }

  return response;
});