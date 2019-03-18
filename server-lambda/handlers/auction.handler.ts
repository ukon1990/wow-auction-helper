import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { Response } from '../utils/response.util';
import { AHDumpResponse } from '../models/auction/ah-dump-response.model';
import { AuthHandler } from './auth.handler';
import { BLIZZARD } from '../secrets';
import { Endpoints } from '../utils/endpoints.util';

const request: any = require('request');
const RequestPromise = require('request-promise');

export class AuctionHandler {

    async post(event: APIGatewayEvent, context: Context, callback: Callback) {
        const body = JSON.parse(event.body),
            region = body.region,
            realm = body.realm,
            timestamp = body.timestamp,
            url = body.url;

        if (url) {
            this.getAuctionDump(url, callback);
        } else {
            this.latestDumpPathRequest(region, realm, timestamp, callback);
        }
        
    }

    async latestDumpPathRequest(region, realm, timestamp, callback: Callback) {
        if (region && realm) {
            let apiResponse;

            await AuthHandler.getToken()
                .then(token => BLIZZARD.ACCESS_TOKEN = token)
                .catch(error => console.error('Unable to fetch token'));

            await this.getLatestDumpPath(region, realm)
                .then(response => apiResponse = response)
                .catch(error => console.error('Unable to fetch data'));
            console.log('Has response?', apiResponse);

            Response.get(apiResponse, callback);
        } else {
            Response.error(callback);
        }
    }

    async getAuctionDump(url: string, callback: Callback) {
        if (url) {
            request.get(url,
                (error, response, body) => {
                    body = JSON.parse(body);

                    if (error) {
                        Response.error(callback)
                        return;
                    }
                    Response.get(body, callback);
                });
        } else {
            Response.error(callback);
        }
    }

    private getLatestDumpPath(region: string, realm: string): Promise<AHDumpResponse> {
        return new Promise<AHDumpResponse>((resolve, reject) => {
            request.get(
                new Endpoints().getPath(`auction/data/${realm}`),
                (error, response, body) => {
                    body = JSON.parse(body);

                    if (error) {
                        // TODO: Logic
                        resolve(undefined);
                    }
                    resolve(body.files[0]);
                })
        });
    }

    private getAuctionLink(event: APIGatewayEvent, context: Context, callback: Callback): Promise<boolean> {
        const url = event['url'] || JSON.parse(event.body).url;
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    private isInS3(): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }

    private sendToS3(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve();
        });
    }
}