import {HttpResponse} from '@models/http-response.model';
import fetch, {Response} from 'node-fetch';

const request: any = require('request');

interface Headers {
  [key: string]: string;
}

export class HttpClientUtil {
  // @ts-ignore
  private readonly timeout?: number;

  constructor(timeout?: number) {
    this.timeout = timeout;
  }

  get<T = any>(url: string, expectJSON: boolean = true, headers?: Headers): Promise<HttpResponse<T>> {
    return new Promise<HttpResponse<T>>((resolve, reject) => {
      // timeout: this.timeout || undefined,
      fetch(url, {
        headers: headers || {
          'User-Agent': 'Mozilla/5.0',
        },
      })
        .then(async (response: Response) => {
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

  /**
   * Handles a HTTP response, and will throw errors if is any issue etc
   * @param expectJSON
   * @param response
   * @param resolve
   * @param reject
   * @private
   */
  private handleResponse(expectJSON: boolean, response: Response, resolve: (value: any) => void, reject: (reason?: any) => void) {
    if (response?.status && response.status >= 400) {
      reject({
        status: response.status,
        statusText: response.statusText,
      });
      return;
    }

    (expectJSON ? response.json() : response.text())
      .then(body => {
        resolve({
          ...response,
          headers: response?.headers?.raw(),
          body,
        });
      })
      .catch(error => {
        if (response?.status && response.status >= 400) {
          reject({
            status: response.status,
            statusText: response.statusText,
            error,
          });
          return;
        }
        reject(error);
      });
  }
}