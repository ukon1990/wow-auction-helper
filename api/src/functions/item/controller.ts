import {ItemServiceV2} from './service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';

export const findMissingItemsAndImport = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const clientId = event['clientId'];
  const clientSecret = event['clientSecret'];
  const isClassic = event['isClassic'] || false;
  const service = new ItemServiceV2(isClassic);
  let response;

  await service.findMissingItemsAndImport(clientId, clientSecret)
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});