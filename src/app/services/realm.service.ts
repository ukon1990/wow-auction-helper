import { Error } from './../utils/error';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RealmService {
  constructor(private http: HttpClient) { }

  getRealms(): Promise<any> {
    return this.http
      .get('/assets/realmList.json')
      .toPromise()
      .catch(e => Error.handle('Was unable to download realms', e));
  }
}
