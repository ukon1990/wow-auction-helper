import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class AuctionService{
  constructor(private http: Http){}

  getAuctions(){
    return this.http.get('http://localhost:8888/wow-api-layer/GetAuctions.php')
      .map(response => <Auction>function(r){ return r;  }(response.json()));
  }
}
