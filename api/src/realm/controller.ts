/* istanbul ignore next */
import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {RealmService} from './service';

exports.getUpdateLogForRealm = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const id = +event.pathParameters.id;
  Endpoints.setStage(event);
  new RealmService().getUpdateLog(id, 24 * 7)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};
