import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {RecipeService} from './service';
import {Response} from '../utils/response.util';

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
  RecipeService.getAllAfter(timestamp, locales || locale)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};
