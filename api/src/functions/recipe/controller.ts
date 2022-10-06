import {RecipeService} from './service/service';
import {DatabaseUtil} from '../../utils/database.util';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from "@shared/services/auth.service";
import {ClassicRecipeService} from "@functions/recipe/service/classic-recipe.service";

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


export const updateRecipes = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isClassic = event['isClassic'] || event.body.isClassic || false;
  // const retailService = new RecipeService(); // isClassic
  const classicService = new ClassicRecipeService();
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();
  let response;

  if (!isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
    if (isClassic) {
      await classicService.getAndInsertAll()
        .then((result) => response = formatJSONResponse(result as any))
        .catch(err => response = formatErrorResponse(err.code, err.message, err));
    } else {
      /*await retailService.
        .then((result) => response = formatJSONResponse(result as any))
        .catch(err => response = formatErrorResponse(err.code, err.message, err));*/
    }
  }
  return response;
});