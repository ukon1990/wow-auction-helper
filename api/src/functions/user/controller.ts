import {middyfy} from '@libs/lambda';
import {APIGatewayEvent} from 'aws-lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {UserService} from './user.service';

export const updateEmail = middyfy(async (event: APIGatewayEvent): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new UserService(event.headers);
  let response;
  await service.updateEmail(event.body.email)
    .then((users) => response = formatJSONResponse(users as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});