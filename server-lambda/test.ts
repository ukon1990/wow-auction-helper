import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { gzipResponse } from './utils/convertion.util';
import { AuctionHandler } from './handlers/auction.handler';
import { Response } from './utils/response.util';
const request: any = require('request');
const RequestPromise = require('request-promise');

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
    Response.send(
        {
            default: 'abcdefg',
            french: `Gentils ascenseurs c'est délicieux pense jour mais savourer nous être rêves au.`,
            russian: 'Тонет глубоко в моём море ненависти',
            nordic: 'xyzæøå',
            chinese: '質性韓演理入相期伐築更読絡質。違故藤老閉需在老償激暮格牲浮音併茶開行。'
        }, callback);
};