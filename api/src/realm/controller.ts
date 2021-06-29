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
exports.updateLastRequestedWithRegionAndSlug = (event: CloudTrailS3Event, context: Context, callback: Callback) => {
  const {
    bucketName,
    key
  } = event.detail.requestParameters;
  const regex = /auctions\/[a-z]{1,4}\/[a-z\-]{1,128}.json.gz/gi;

  if (regex.exec(key) && key.indexOf('status') === -1) {
    const splitted = key.split('/');
    const [auctions, region, slug] = splitted;
    console.log('Updating last requested for AH', region, slug);
    new RealmService().updateLastRequestedWithRegionAndSlug(
      region,
      slug.replace('.json.gz', ''),
      +new Date()
    )
      .then(res => Response.send(res, callback))
      .catch(err => Response.error(callback, err, undefined, 401));
    } else {
      Response.send({message: 'Hello'}, callback);
    }
};
