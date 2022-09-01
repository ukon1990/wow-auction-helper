import {DashboardService} from './service';
import {AuthorizationUtil} from '../../utils/authorization.util';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';

export const getAll = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const token = AuthorizationUtil.isValidToken(event);
  const service = new DashboardService(token);
  let response;

  await service.getAll()
    .then((boards) => response = formatJSONResponse(
      boards.filter(board => board.rules.length || board.itemRules.length) as any)
    )
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const save = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const token = AuthorizationUtil.isValidToken(event);
  const service = new DashboardService(token);
  let response;
  if (!token) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    await service.save(event.body)
      .then((board) => response = formatJSONResponse(board as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});

export const copy = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const token = AuthorizationUtil.isValidToken(event);
  const id = event.pathParameters.id;
  const service = new DashboardService(token);
  let response;

  await service.getCopyById(id, token)
    .then((board) => response = formatJSONResponse(board as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const deleteDashboard = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const token = AuthorizationUtil.isValidToken(event);
  const service = new DashboardService(token);
  let response;
  if (!token) {
    response = formatErrorResponse(401, 'Not authorized');
  } else {
    const id = event.pathParameters.id;
    await service.delete(id)
      .then((board) => response = formatJSONResponse(board as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});