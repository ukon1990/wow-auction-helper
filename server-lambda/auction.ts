import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
const zlib = require('zlib');
const request: any = require('request');
const RequestPromise = require('request-promise');

exports.getAuctions = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  console.log('',event);
  let url = event['url'] || JSON.parse(event.body).url;
  try {
    let response = {
      realms: [],
      auctions: []
    };
    if (url) {
      console.log('url', url);
  
      if (url && url.indexOf('.worldofwarcraft.com/auction-data') !== -1) {
        console.log('Contains url');
        request.get(url, (error, res, body) => {
          if (error) {
            console.error('getAuctions', error);
            callback(null, response);
            return;
          }
          console.log('attempting zlib');
          zlib.gzip(new Buffer(body, 'utf-8'), function(error, ahData) {
            if(error) context.fail(error);
            console.log('zlibbed');
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
            callback(null, res);
        });
        });
      }
  
    } else {
      console.log('else', event);
    }
  } catch (error) {
    console.log(error);
    callback(null, error);
  }
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
