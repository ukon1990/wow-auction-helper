import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
const zlib = require('zlib');
const request: any = require('request');
const RequestPromise = require('request-promise');

exports.getAuctions = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  console.log('', event);
  const testing = false;
  const url = testing ?
    'http://localhost:4200/assets/mock/auctions.json' : event['url'] || JSON.parse(event.body).url;
  const response = {
    realms: [],
    auctions: []
  };
  try {
    if (url && testing) {
      console.log('url', url);
      if (url && (url.indexOf('.worldofwarcraft.com/auction-data') !== -1 || testing)) {
        console.log('Contains url');
        request.get(url, (error, res, body) => {
          console.log('inside');
          if (error) {
            console.error('getAuctions', error);
            gzipResponse(context, JSON.stringify(response), callback);
            return;
          }
          console.log('attempting zlib');
          gzipResponse(context, body, callback);
        });
      } else {
        gzipResponse(context, response, callback);
      }
    } else {
      console.log('else', event);
      gzipResponse(context, response, callback);
    }
  } catch (error) {
    console.log(error);
    gzipResponse(context, response, callback);
  }
};

function gzipResponse(context: Context, body, callback: Callback): void {
  zlib.gzip(
    new Buffer(
      typeof body === 'string' ? body : JSON.stringify(body), 'utf-8'),
    (err, ahData) => {
    if (err) {
      context.fail(err);
    }
    const res = {
        statusCode: 200,
        body: ahData.toString('base64'),
        isBase64Encoded: true,
        headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip'
        }
    };
    // context.succeed(response);
    console.log('gzipped');
    callback(null, res);
  });
}

function removeUnused(auctionResponse) {
  const response = {
    realms: auctionResponse.realms,
    auctions: auctionResponse.auctions
  };

  response.auctions.forEach((auction) => {
    // delete auction.auc;
    delete auction.context;
    delete auction.rand;
    delete auction.seed;
  });

  return response;
}
