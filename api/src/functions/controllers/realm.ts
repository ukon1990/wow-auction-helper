import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {RealmHandler} from '../handlers/realm.handler';
import {Endpoints} from '../../utils/endpoints.util';
import {TextUtil} from '@ukon1990/js-utilities';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === 'POST') {
    new RealmHandler()
      .getStatus(event, callback);
  } else {
    Response
      .error(callback, 'The method you provided, is not available.', event);
  }
};

/* istanbul ignore next */
exports.realmAllRegions = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const host = event.headers.Host;
  let region;
  if (TextUtil.contains(host, '.eu-')) {
    region = 'eu';
  }
  if (TextUtil.contains(host, '.us-')) {
    region = 'us';
  }
  if (TextUtil.contains(host, '.ap-')) {
    region = 'ap';
  }
  new RealmHandler()
    .getAllRealmsFromS3(region)
    .then((res) => {
      Response.send(res, callback, false);
    })
    .catch(error => Response.error(callback, error, event));
};

exports.realmS3GetEvent = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  const {bucketName, key} = event['detail'].requestParameters;
  new RealmHandler().checkIfRealmIsInactive(bucketName, key)
    .then((res) => Response.send(res, callback))
    .catch(error => Response.error(callback, error, event));
};