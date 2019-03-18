export class Response {
    public static get(body: any) {
        return {
            statusCode: 200,
            body: JSON.stringify(body),
            isBase64Encoded: false,
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Encoding': 'gzip',
                'Character-Encoding': 'UTF8'
            }
        };
    }

    public static error(): any {
        return Response.get({
            statusCode: 500,
            message: 'Malormed request'
        });
    }
}
