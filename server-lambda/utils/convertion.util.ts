import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
const zlib = require('zlib');

export const gzipResponse = (context: Context, body, callback: Callback): void => {
    zlib.gzip(
        new Buffer(
            typeof body === 'string' ? body : JSON.stringify(body), 'utf-8'),
        (err, ahData) => {
            if (err) {
                context.fail(err);
            }
            // context.succeed(response);
            console.log('gzipped');
            callback(null, {
                statusCode: 200,
                body: ahData.toString('base64'),
                isBase64Encoded: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'gzip',
                    'Character-Encoding': 'UTF8'
                }
            });
        });
}