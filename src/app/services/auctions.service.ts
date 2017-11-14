import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { IAuction } from '../utils/interfaces';
import { user, DB_TABLES, db } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

declare var $;
@Injectable()
export class AuctionService {
  private user;
  constructor(private http: HttpClient) {
    this.user = user;
  }

  getAuctions(url, timestamp): Promise<any> {
    url = 'http://wah.jonaskf.net/GetAuctions.php?url=' + url;
    const localUrl = '/assets/auctions.json';
    return this.http.get(this.getUrl(url, localUrl))
      .map(response => <IAuction>function (r) {
        console.log('Loaded auctions');
        if (typeof r === 'object') {
          db['auctions'].clear();
          db['auctions'].bulkAdd(r['auctions']);
          console.log('Done storing auctions in object store');
          localStorage.setItem('timestamp_auctions', timestamp);
        }
        return r;
      }(response), e => {
        console.log('Unable to download "live" auctions', e);
      }).toPromise();
  }

  getWoWuctionData() {
    const localUrl = '/assets/wowuction.tsv',
      apiUrl = 'http://www.wowuction.com/' + localStorage.getItem('region') + '/' +
        localStorage.getItem('realm') + '/alliance/Tools/RealmDataExportGetFileStatic?token=' + localStorage.getItem('api_wowuction'),
      url = this.getUrl(apiUrl, localUrl);

    // TODO: Make it not use the local URL by storing the value temporarily with Dexie!
    return this.http.get(url)
      .map(res => function (r: string) {
        db['wowuction'].clear();
        const list = [];
        let obj = {},
          tempObj = {},
          isFirst = true;
        // 5 == itemID, 7 == market price,
        // 14 == Avg Daily Posted, 15 == Avg Estimated Daily Sold,
        // 16 == Estimated demand
        r.split('\n').forEach(function (l) {
          if (isFirst) {
            isFirst = false;
            // console.log(l.split('\t'));
          } else {
            tempObj = l.split('\t');
            obj = {
              'id': parseInt(tempObj[4], 10),
              'mktPrice': tempObj[6],
              'avgDailyPosted': tempObj[15],
              'avgDailySold': tempObj[16],
              'estDemand': tempObj[17],
              'realm': tempObj[0]
            };
            db['wowuction'].add(obj);
            list[obj['id']] = obj;
            // db['wowuction'].add(obj);
          }
        });
        db.table('wowuction').toArray().then(arr => { console.log('wowuction', arr); });
        localStorage.setItem('timestamp_wowuction', new Date().toDateString());
        return list;
      }(res['_body'].toString()));
  }

  // Need to ask the user how often they want this data to be updated.
  getTSMData() {
    // The localhost requires a json file for the realm!
    const localUrl = '/assets/tsm-emerald-dream.json',
      apiUrl = 'http://api.tradeskillmaster.com/v1/item/'
        + localStorage.getItem('region') + '/'
        + localStorage.getItem('realm')
        + '?fields=' + DB_TABLES.TSM_TABLE_COLUMNS + '&format=json&apiKey=' + localStorage.getItem('api_tsm');

    return this.http.get(this.getUrl(apiUrl, localUrl))
      .map(response => <any>function (r) {
        console.log('Loaded TSM');
        db['tsm'].clear();
        db['tsm'].bulkAdd(r);
        localStorage.setItem('timestamp_tsm', new Date().toDateString());
        return r;
      }(response));
  }

  getLastUpdated(): Promise<any> {
    const localUrl = '/assets/GetAuctionsLastModified.json',
      apiUrl = 'http://wah.jonaskf.net/GetAuctions.php?region='
        + localStorage.getItem('region') + '&realm=' + localStorage.getItem('realm') + '&lastModified';
    console.log('Getting last modified for auctions');
    return this.http.get(this.getUrl(apiUrl, localUrl)).toPromise();
  }

  getUrl(apiUrl, localUrl) {
    if (window.location.hostname === 'localhost') {
      console.log('Using local files');
    }
    return window.location.hostname === '_localhost' ? localUrl : apiUrl;
  };
}
