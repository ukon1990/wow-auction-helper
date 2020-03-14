const request: any = require('request');

export class HttpClientUtil {
  get(url: string, expectJSON: boolean = true, headers: any = {}): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request.get(
        {
          url,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            ...headers
          }
        },
        (error, response, body) => {
          try {

            if (!error && response.statusCode === 304) {
              resolve(response);
              return;
            }

            if (error || !body || response.statusCode === 404) {
              reject(error);
              console.log('Http error for', url, error);
              return;
            }

            if (expectJSON) {
              response.body = JSON.parse(body);
            }
            resolve(response);
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  head(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request({
          method: 'HEAD',
          url,
        },
        (error, response) => {
          try {
            if (error || !response || response.statusCode === 404) {
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

            if (error || !body || response.statusCode === 404) {
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
