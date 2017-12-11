import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { AuctionHandler } from '../models/auction/auction-handler';

@Injectable()
export class AuctionsService {

  constructor(private _http: HttpClient) { }

    getAuctions(): void {
      console.log('Downloading auctions');
      this._http.get('assets/mock/auctions.json')
        .toPromise()
        .then(a => {
          AuctionHandler.organize(a['auctions']);
          console.log(SharedService.auctions);
          console.log('Auction download is completed');
        })
        .catch(e => console.error('Auction download failed', e));
    }

}
