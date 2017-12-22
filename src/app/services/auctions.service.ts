import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { AuctionHandler } from '../models/auction/auction-handler';
import { Dashboard } from '../models/dashboard';

@Injectable()
export class AuctionsService {

  constructor(private _http: HttpClient) { }

  getAuctions(): Promise<any> {
    console.log('Downloading auctions');
    return this._http.get('assets/mock/auctions.json')
      .toPromise()
      .then(a => {
        AuctionHandler.organize(a['auctions']);
        console.log(SharedService.auctions);
        console.log('Auction download is completed');

        // Dashboard stuff
        SharedService.dashboards
          .push(
          new Dashboard(
            'Most profitable crafts',
            Dashboard.TYPES.MOST_PROFITABLE_CRAFTS));

        SharedService.dashboards
          .push(
          new Dashboard(
            'Items with highest availability',
            Dashboard.TYPES.MOST_AVAILABLE_ITEMS));
        SharedService.dashboards
          .push(
          new Dashboard(
            'Selles with highest volume',
            Dashboard.TYPES.TOP_SELLERS_BY_VOLUME));
      })
      .catch(e => console.error('Auction download failed', e));
  }
}
