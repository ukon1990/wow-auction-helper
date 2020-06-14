import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {RecipeService} from '../recipe/service';
import {Response} from '../utils/response.util';
import {ProfessionService} from './service';

const getProfessions = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {timestamp, locale} = JSON.parse(event.body);
  ProfessionService.getAll(locale)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};