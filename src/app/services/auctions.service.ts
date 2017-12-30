import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { AuctionHandler } from '../models/auction/auction-handler';
import { Dashboard } from '../models/dashboard';
import { TSM } from '../models/auction/tsm';

@Injectable()
export class AuctionsService {

  constructor(private _http: HttpClient) { }

  getAuctions(): Promise<any> {
    console.log('Downloading auctions');
    return this._http.get('assets/mock/auctions.json')
      .toPromise()
      .then(a => {
        AuctionHandler.organize(a['auctions']);
        console.log('Auction download is completed');
      })
      .catch(e => console.error('Auction download failed', e));
  }

  getTsmAuctions(): Promise<any> {
    return this._http.get('assets/mock/tsm.json')
      .toPromise()
      .then(tsm => (<TSM[]>tsm).forEach(a => {
        SharedService.tsm[a.Id] = a;
      }))
      .catch(e => console.error('Unable to download TSM data', e));
  }
}
