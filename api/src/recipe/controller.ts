import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {RecipeService} from './service/service';
import {Response} from '../utils/response.util';
import {DatabaseUtil} from '../utils/database.util';

export const getById = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {id, locale} = JSON.parse(event.body);
  RecipeService.getById(id, locale)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};

export const getByIds = (event: APIGatewayEvent, context: Context, callback: Callback) => {

};

export const getAfter = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {timestamp, locales, locale} = JSON.parse(event.body);
  const db = new DatabaseUtil(false);
  RecipeService.getAllAfter(timestamp || 0, locales || locale, db)
    .then(res => {
      db.end();
      Response.send(res, callback);
    })
    .catch(err => {
      db.end();
      Response.error(callback, err, event, 500);
    });
};
