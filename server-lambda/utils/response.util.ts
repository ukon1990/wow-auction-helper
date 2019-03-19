import {Callback} from 'aws-lambda';

const zlib = require('zlib');

export class Response {
    public static async get(body: any, callback: Callback) {
        const gzip = zlib.createGzip();
        zlib.gzip(JSON.stringify(body), (error, buffer) => {
            console.log('get', error, buffer);
            callback(null, {
                statusCode: 200,
                body: buffer.toString('base64'),
                isBase64Encoded: true,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'gzip',
                    'Character-Encoding': 'UTF8'
                }
            });
        });
    }

    public static error(callback: Callback, error?): any {
        if (error) {
            console.error(error);
        }
        return Response.get({
            statusCode: 500,
            message: 'Malormed request'
        }, callback);
    }
}
