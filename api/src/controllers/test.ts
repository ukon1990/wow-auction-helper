import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';
import {HttpClientUtil} from '../utils/http-client.util';
import {AuthHandler} from '../handlers/auth.handler';
import {AuctionTransformerUtil} from '../utils/auction-transformer.util';
import {AuctionHandler} from '../handlers/auction.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // Endpoints.setStage(event);
  /*
  const detail = event['detail'];
  console.log('requestParameters', detail.requestParameters);
  console.log('Resources', detail.resources);*/

  // /wow/realm/status
  new AuctionHandler().getAuctionDumpV2(1403, 'eu', 'en_GB', +new Date('Fri, 21 Feb 2020 21:41:25 GMT'))
    .then((res) => {
          Response.send(res, callback);
        })
        .catch(err => {
          Response.error(callback, err, event);
        });
};
