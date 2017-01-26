import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IAuction } from '../utils/interfaces';
import { user } from '../utils/globals';

import 'rxjs/add/operator/map';

@Injectable()
export class AuctionService {
    private user;
    constructor(private http: Http) {
        this.user = user;
    }

    getAuctions() {
		let localUrl = '/assets/auctions.json';
		let apiUrl = 'http://www.wah.jonaskf.net/GetAuctions.php?region=' + this.user.region + '&realm=' + this.user.realm;
		return this.http.get(localUrl)
			.map(response => <IAuction>function(r) { console.log('Loaded auctions'); return r; } (response.json()));
	}

	getWoWuctionData() {
		let url = '/assets/wowuction.tsv';
		return this.http.get(url)
			.map(res => function(r: string){
				let list = [],
					obj = {},
					tempObj = {},
					isFirst = true;
				// 5 == itemID, 7 == market price,
				// 14 == Avg Daily Posted, 15 == Avg Estimated Daily Sold,
				// 16 == Estimated demand
				r.split('\n').forEach(function(l) {
					if(isFirst) {
						isFirst = false;
						console.log(l.split('\t'));
					}else{
						tempObj = l.split('\t');
						obj = {
							'id': parseInt(tempObj[4]),
							'mktPrice': tempObj[6],
							'avgDailyPosted': tempObj[15],
							'avgDailySold': tempObj[16],
							'estDemand': tempObj[17],
							'realm': tempObj[0]
						};
						list[obj['id']] = obj;
					}
				});
				return list;
			}(res['_body'].toString()));
	}

	getLastUpdated() {
		return this.http.get('http://www.wah.jonaskf.net/GetAuctions.php?region='
			+ this.user.region + '&realm=' + this.user.realm + '&lastModified')
			.map(response => <IAuction>function(r) { console.log('Loaded auctions'); return r; } (response.json()));
	}
}
