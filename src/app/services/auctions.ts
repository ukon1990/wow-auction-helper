import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class AuctionService{
  constructor(private http: Http){}

  getAuctions(){
      let localUrl: string = '/assets/auctions.json';
      let apiUrl: string = 'http://www.wah.jonaskf.net/GetAuctions.php?region=eu&realm=emerald-dream';
      let apiUrlBlizz: string = 'http://auction-api-eu.worldofwarcraft.com/auction-data/e4a529d50fe9f24cff1ad0bf1c56c897/auctions.json';
    return this.http.get(localUrl)
      .map(response => <Auction>function(r){ console.log('Loaded auctions');return r;  }(response.json()));
  }
}
