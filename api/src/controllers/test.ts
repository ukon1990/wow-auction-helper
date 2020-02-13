import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';
import {HttpClientUtil} from '../utils/http-client.util';
import {AuthHandler} from '../handlers/auth.handler';

exports.handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  /*
  const detail = event['detail'];
  console.log('requestParameters', detail.requestParameters);
  console.log('Resources', detail.resources);*/

  await AuthHandler.getToken();
  const url = new Endpoints().getPath('connected-realm/1146/auctions?namespace=dynamic-us&locale=en_US', 'us', true);
  console.log('Path', url);
  new HttpClientUtil().get(url, true)
    .then(res => {
      console.log('res', res);
      Response.send({shit:'addasd'}, callback);
    })
    .catch(err => {
      console.error('Err', err);
      Response.error(callback, {shit:'addasd', err}, event);
    });
};
