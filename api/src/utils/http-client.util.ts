const request: any = require('request');
import fetch from 'node-fetch';

export class HttpClientUtil {
  private readonly timeout?: number;

  constructor(timeout?: number) {
    this.timeout = timeout;
  }
  get(url: string, expectJSON: boolean = true, headers: any = {}): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // timeout: this.timeout || undefined,
      fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...headers
        },
      })
        .then(async response => {
          (expectJSON ? response.json() : response.text())
            .then(body => {
              resolve({
                ...response,
                headers: response?.headers?.raw(),
                body,
              });
            })
            .catch(reject);
        })
        .catch(error => {
          console.error('Http error for', url, error);
          reject(error);
        });
    });
  }

  head(url: string, headers?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request({
          method: 'HEAD',
          url,
          headers,
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