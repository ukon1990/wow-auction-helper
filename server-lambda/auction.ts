import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { gzipResponse } from './utils/convertion.util';
import { AuctionHandler } from './handlers/auction.handler';
const request: any = require('request');
const RequestPromise = require('request-promise');

exports.request = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  AuctionHandler.route(event, context, callback);
};


exports.getAuctions = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  console.log('', event);
  const testing = false;
  const url = event['url'] || JSON.parse(event.body).url;
  const response = {
    realms: [],
    auctions: []
  };
  try {
    if (url) {
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
