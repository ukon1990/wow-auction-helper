import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AdminService} from './admin.service';
import {middyfy} from '@libs/lambda';
import {UserService} from '@functions/admin/user.service';
import {APIGatewayEvent} from 'aws-lambda';

export const optimizeTable = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AdminService();
  let response;
  await service.optimizeTable(event['table'])
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const getUserList = middyfy(async (event: APIGatewayEvent): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new UserService(event.headers);
  let response;
  await service.getAll()
    .then((users) => response = formatJSONResponse(users as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const user = middyfy(async (event: APIGatewayEvent): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new UserService(event.headers);
  let response;
  switch (event.httpMethod) {
    case 'delete':
      await service.deleteUser(event.pathParameters?.username)
        .then((users) => response = formatJSONResponse(users as any))
        .catch(err => response = formatErrorResponse(err.code, err.message, err));
      break;
    default: response = formatErrorResponse(401, 'Method not allowed');
  }

  return response;
});