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
  const regex = /auctions\/[a-z]{1,4}\/[a-z\-]{1,128}.json.gz/gi;
  const statusRegex = /status\/[a-z]{1,4}\/[0-9\-]{1,128}.json.gz/gi;
  console.log('File event triggered for', key);

  // TODO: Replace this part as soon as it's frontend part is deactivated
  if (regex.exec(key) && key.indexOf('status') === -1) {
    const splitted = key.split('/');
    const [_, region, slug] = splitted;
    console.log('Updating last requested for AH', region, slug);
    new RealmService().updateLastRequestedWithRegionAndSlug(
      region,
      slug.replace('.json.gz', '')
    )
      .then(res => Response.send(res, callback))
      .catch(err => Response.error(callback, err, undefined, 401));
    } else if (statusRegex.exec(key) && key.indexOf('status') === 0) {
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

/*
exports.updateLastRequested = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {
    id,
    lastRequested,
  } = JSON.parse(event.body);

  new RealmService().updateLastRequested(+id, +lastRequested)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, undefined, 401));
};
*/
