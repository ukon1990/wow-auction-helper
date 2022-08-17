import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AdminService} from './admin.service';
import {middyfy} from '@libs/lambda';

export const optimizeTable = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AdminService();
  let response;
  await service.optimizeTable(event['table'])
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});