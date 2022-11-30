import {RecipeService} from './service/service';
import {DatabaseUtil} from '../../utils/database.util';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from '@shared/services/auth.service';
import {ClassicRecipeService} from '@functions/recipe/service/classic-recipe.service';
import {RecipeV2Util} from '@functions/recipe/util/recipev2.util';
import {APIGatewayEvent} from 'aws-lambda/trigger/api-gateway-proxy';
import {UpdatesService} from '@functions/updates/service';
import {APIRecipe} from '@shared/models';

export const getById = middyfy(async ({body}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const {id, locale} = body;

  await RecipeService.getById(id, locale)
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

export const getAfter = middyfy(async ({body, headers}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const authService = new AuthService(headers);
  const isAdmin = await authService.isAdmin();

  if (!isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
    const {timestamp, locales, locale} = body || {};
    const db = new DatabaseUtil(false);
    await RecipeService.getAllAfter(timestamp || 0, locales || locale || 'en_GB', db, true)
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err))
      .finally(() => db.end());
  }

  return response;
});

export const updateRecipe = middyfy(async ({body, headers}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  // const retailService = new RecipeService();
  const authService = new AuthService(headers);
  const isAdmin = await authService.isAdmin();
  let response;

  if (!isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
    await RecipeV2Util.updateRecipe(body as APIRecipe)
    // await RecipeV2Util.getRecipeFromAPI(36452)
    .then(async (result) => {
      await UpdatesService.getAndSetRecipes()
        .then(() => console.log('Done uploading recipes'))
        .catch(console.error);
      await UpdatesService.getAndSetTimestamps()
        .then(() => console.log('Done updating the timestamps'))
        .catch(console.error);
      response = formatJSONResponse(result as any);
    })
    .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }
  return response;
});

export const updateRecipes = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const isClassic = event['isClassic'] || event.body.isClassic || false;
  // const retailService = new RecipeService();
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
      await RecipeV2Util.getAndMapProfessions()
      // await RecipeV2Util.getRecipeFromAPI(36452)
        .then(async (result) => {
          await (isClassic ? UpdatesService.getAndSetClassicRecipes() : UpdatesService.getAndSetRecipes())
            .then(() => console.log('Done uploading recipes'))
            .catch(console.error);
          await UpdatesService.getAndSetTimestamps()
            .then(() => console.log('Done updating the timestamps'))
            .catch(console.error);
          response = formatJSONResponse(result as any);
        })
        .catch(err => response = formatErrorResponse(err.code, err.message, err));
    }
  }
  return response;
});

export const updateOnUse = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();
  let response;

  if (!isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
      await RecipeService.getOnUseRecipes()
      // await RecipeV2Util.getRecipeFromAPI(36452)
        .then((result) => response = formatJSONResponse(result as any))
        .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }
  return response;
});

export const compareRecipeAPI = middyfy(async (event: APIGatewayEvent): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();
  const {id} = event.pathParameters;
  let response;

  if (!isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
      await RecipeService.compareRecipeAPI(+id)
      // await RecipeV2Util.getRecipeFromAPI(36452)
        .then((result) => response = formatJSONResponse(result as any))
        .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }
  return response;
});