import {UpdatesService} from './service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';

export const syncS3WithTheDatabase = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;

  await UpdatesService.syncS3WithTheDatabase()
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});