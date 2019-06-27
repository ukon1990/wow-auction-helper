const request: any = require('request');

export class HttpClientUtil {
  get(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request.get(
        url,
        (error, response, body) => {
          try {
            response.body = JSON.parse(body);

            if (error) {
              reject(error);
            }
            resolve(response);
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  post(url: string, requestBody: any, ignoreHttpResponse?: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request.post({
          headers: {
            'Content-Type': 'application/json'
          },
          url: url,
          body: JSON.stringify(requestBody)
        },
        (error, response, body) => {
          try {

            if (error) {
              reject(error);
            }
            if (ignoreHttpResponse) {
              resolve('success');
            } else {
              response.body = JSON.parse(body);
              resolve(response);
            }
          } catch (e) {
            reject(e);
          }
        });
    });
  }
}
