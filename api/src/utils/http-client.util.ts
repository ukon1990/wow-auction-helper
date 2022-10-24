import {HttpResponse} from '@models/http-response.model';
import fetch from 'node-fetch';

const request: any = require('request');

interface Headers {
  [key: string]: string;
}

export class HttpClientUtil {
  private readonly timeout?: number;

  constructor(timeout?: number) {
    this.timeout = timeout;
  }

  get<T = any>(url: string, expectJSON: boolean = true, headers: Headers): Promise<T> {
    return new Promise<any>((resolve, reject) => {
      // timeout: this.timeout || undefined,
      fetch(url, {
        headers: headers || {
          'User-Agent': 'Mozilla/5.0',
        },
      })
        .then(async response => {
          this.handleResponse(expectJSON, response, resolve, reject);
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

  post<T = any>(url: string, requestBody: any, ignoreHttpResponse?: boolean, headers?: Headers): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      fetch(url, {
        headers: headers || {
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify(requestBody),
        method: 'POST',
      })
        .then(async response => {
          if (!ignoreHttpResponse) {
            this.handleResponse(true, response, resolve, reject);
            return;
          }
          resolve(undefined);
        })
        .catch(error => {
          console.error('Http error for', url, error);
          reject(error);
        });
    });
  }

  private handleResponse(expectJSON: boolean, response: any, resolve: (value: any) => void, reject: (reason?: any) => void) {
    (expectJSON ? response.json() : response.text())
      .then(body => {
        resolve({
          ...response,
          headers: response?.headers?.raw(),
          body,
        });
      })
      .catch(reject);
  }
}