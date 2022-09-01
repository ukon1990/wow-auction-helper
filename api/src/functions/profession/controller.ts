import {ProfessionService} from './service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';


export const getProfessions = middyfy(async ({body}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;

  const {locale} = body;
  await ProfessionService.getAll(locale)
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});