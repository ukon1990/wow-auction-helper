import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';
import {HttpClientUtil} from '../utils/http-client.util';
import {AuthHandler} from '../handlers/auth.handler';
import {AuctionTransformerUtil} from '../utils/auction-transformer.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // Endpoints.setStage(event);
  /*
  const detail = event['detail'];
  console.log('requestParameters', detail.requestParameters);
  console.log('Resources', detail.resources);*/

  AuthHandler.getToken()
    .then(() => {
      const url = new Endpoints().getPath('connected-realm/1146/auctions?namespace=dynamic-us&locale=en_US', 'us', true);
      new HttpClientUtil().get(url)
        .then(({body}) => {
          console.log('Got response', AuctionTransformerUtil.transform(body));
          Response.send(AuctionTransformerUtil.transform(body), callback);
        })
        .catch(err => {
          Response.error(callback, err, event);
        });
    });
};
