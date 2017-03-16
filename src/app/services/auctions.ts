import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { IAuction } from '../utils/interfaces';
import { user, DB_TABLES, db } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';

@Injectable()
export class AuctionService {
	private user;
	constructor(private http: Http) {
		this.user = user;
	}

	getAuctions() {
		let localUrl = '/assets/auctions.json',
			apiUrl = 'http://www.wah.jonaskf.net/GetAuctions.php?region=' + this.user.region + '&realm=' + this.user.realm;

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(response => <IAuction>function (r) { console.log('Loaded auctions'); return r; }(response.json()));
	}

	getWoWuctionData() {
		let localUrl = '/assets/wowuction.tsv',
			apiUrl = 'http://www.wowuction.com/'+ localStorage.getItem('region') +'/'+
						localStorage.getItem('realm') +'/alliance/Tools/RealmDataExportGetFileStatic?token=' + localStorage.getItem('api_wowuction'),
			url = this.getUrl(apiUrl, localUrl);

		return this.http.get(url)
			.map(res => function (r: string) {
				let list = [],
					obj = {},
					tempObj = {},
					isFirst = true;
				// 5 == itemID, 7 == market price,
				// 14 == Avg Daily Posted, 15 == Avg Estimated Daily Sold,
				// 16 == Estimated demand
				r.split('\n').forEach(function (l) {
					if (isFirst) {
						isFirst = false;
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
						list[obj['id']] = obj;
					}
				});
				return list;
			}(res['_body'].toString()));
	}

	// Need to ask the user how often they want this data to be updated.
	getTSMData(): Promise<any[]> {
		let localUrl = '/assets/tsm-emerald-dream.json';
		let apiUrl = 'http://api.tradeskillmaster.com/v1/item/'
			+ this.user.region + '/'
			+ this.user.realm
			+ '?fields=' + DB_TABLES.TSM_TABLE_COLUMNS + '&format=json&apiKey=' + localStorage.getItem('api_tsm');

		if(new Date(parseInt(localStorage.getItem('timestamp_tsm'), 10)).toDateString() !== new Date().toDateString()) {
			return this.http.get(this.getUrl(apiUrl, localUrl)).toPromise()
			.then(response => <any>function (r) {
				console.log('Loaded TSM');
				r.forEach( obj => {
					db['tsm'].add(obj);
				});
				return r;
			}(response.json()));
		} else {
			console.log('Loaded TSM from local DB');
			db.table('tsm').get(25).then(shit => console.log(shit));
			return new Promise(function(){return db.table('tsm').toArray().then(result => {return result;})});
		}
	}

	getLastUpdated() {
		return this.http.get('http://www.wah.jonaskf.net/GetAuctions.php?region='
			+ this.user.region + '&realm=' + this.user.realm + '&lastModified')
			.map(response => <IAuction>function (r) {
				console.log('API last updated ' + new Date(r.lastModified).toLocaleTimeString());
				return r;
			}(response.json()));
	}

	getUrl(apiUrl, localUrl) {
		if(window.location.hostname === 'localhost') {
			console.log('Using local files', localUrl);
			return localUrl;
		}

		return apiUrl;
	};
}
