import {RecipeService} from './service/service';
import {DatabaseUtil} from '../../utils/database.util';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';

export const getById = middyfy(async ({body}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const {id, locale} = body;

  await RecipeService.getById(id, locale)
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const getAfter = middyfy(async ({body}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;

  const {timestamp, locales, locale} = body;
  const db = new DatabaseUtil(false);
  await RecipeService.getAllAfter(timestamp || 0, locales || locale, db)
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err))
    .finally(() => db.end());

  return response;
});