import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { Response } from '../utils/response.util';
import { AHDumpResponse } from '../models/auction/ah-dump-response.model';

const request: any = require('request');
const RequestPromise = require('request-promise');

export class AuctionHandler {

public static post (event: APIGatewayEvent, context: Context, callback: Callback) {
    const body = JSON.parse(event.body),
        region = body.region,
        realm = body.realm,
        timestamp = body.timestamp;

    if (region && realm) {
        callback(null, 
            Response.get(event));
    } else {
        callback(null, 
            Response.error());
    }
}

public static getLatestDumpResponse(region: string, realm: string): Promise<AHDumpResponse> {
    return request.get('',  (error, response, body) => {
        if (error || !body.files) {
            // TODO: Logic
            return {files : []};
        }
        return body;
    });
}

public static getAuctionLink(event: APIGatewayEvent, context: Context, callback: Callback): Promise<boolean> {
    const url = event['url'] || JSON.parse(event.body).url;
    return new Promise<any>((resolve, reject) => {
        resolve();
    });
}

    public static isInS3(): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    public static sendToS3(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }
}