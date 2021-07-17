/* istanbul ignore next */
import {APIGatewayEvent, Callback, Context, S3Event} from 'aws-lambda';
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

exports.getStatus = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const id = +event.pathParameters.id;
  Endpoints.setStage(event);
  new RealmService().getUpdateLog(id, 24 * 7)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

interface CloudTrailS3Event {
  detail: {
    requestParameters: {
      bucketName: string;
      Host: string;
      key: string;
    };
  };
}

/**
 * This function is used to make sure that realms that are actively used, does not get "deactivated" for hourly updates.
 * @param event
 * @param context
 * @param callback
 */
exports.updateLastRequested = (event: CloudTrailS3Event, context: Context, callback: Callback) => {
  const key = event.detail.requestParameters.key;
  const statusRegex = /status\/[a-z]{1,4}\/[0-9\-]{1,128}.json.gz/gi;

  if (key.indexOf('auctions') === -1 && statusRegex.exec(key) && key.indexOf('status') === 0) {
    console.log('File event triggered for', key);
    const splitted = key.split('/');
    const [_, __, id] = splitted;
    console.log('Updating last requested for AH', id);
    new RealmService().updateLastRequested(
      +id.replace('.json.gz', '')
    )
      .then(res => Response.send(res, callback))
      .catch(err => Response.error(callback, err, undefined, 401));
  } else {
    Response.send({message: 'Hello'}, callback);
  }
};
