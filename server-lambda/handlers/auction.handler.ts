import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export class AuctionHandler {

public static route (event: APIGatewayEvent, context: Context, callback: Callback) {
    callback(null, {
        statusCode: 200,
        body: event,
        isBase64Encoded: true,
        headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
            'Character-Encoding': 'UTF8'
        }
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