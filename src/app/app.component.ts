import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuctionService } from './services/auctions';
import { ItemService } from './services/item';
import { user, lists, getPet, db } from './utils/globals';
import { IUser } from './utils/interfaces';

declare var ga: Function;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [AuctionService]
})
export class AppComponent {
	// http://realfavicongenerator.net/
	private title = 'WAH';
	private lastModified: number;
	private timeSinceLastModified: number;
	private oldTimeDiff: number;
	private date: Date;
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};
	private u: IUser;
	private downloadingText = '';

	constructor(private auctionService: AuctionService,
		private itemService: ItemService,
		private router: Router) {
		this.u = user;

		// Google Analytics
		router.events.subscribe( (event: Event) => {
			if(event instanceof NavigationEnd) {
				ga('set', 'page', router.url);
				ga('send', 'pageview');
			}
		});
	}

	ngOnInit() {
		this.date = new Date();
		if (this.isRealmSet()) {
			// Loading user settings
			try {
				this.u.region = localStorage.getItem('region') || undefined;
				this.u.realm = localStorage.getItem('realm') || undefined;
				this.u.character = localStorage.getItem('character') || undefined;
				this.u.apiTsm = localStorage.getItem('api_tsm') || undefined;
				this.u.apiWoWu = localStorage.getItem('api_wowuction') || undefined;
				this.u.customPrices = JSON.parse(localStorage.getItem('custom_prices')) || undefined;
				this.u.apiToUse = localStorage.getItem('api_to_use') || 'none';
			} catch(e) {
				console.log('app.component init', e);
			}

			this.checkForUpdate();

			if(localStorage.getItem('api_tsm') !== null &&
				localStorage.getItem('api_tsm') !== undefined &&
				localStorage.getItem('api_tsm').length > 0 &&
				localStorage.getItem('api_tsm') !== 'null') {
				if (new Date(localStorage.getItem('timestamp_tsm')).toDateString() !== new Date().toDateString()) {
					this.auctionService.getTSMData().subscribe(r => {
						lists.tsm = r;
					}, err => {
						console.log(err);
					});
				} else {
					console.log('Loaded TSM from local DB');
					db.table('tsm').toArray().then(
						result => {
							result.forEach( r => {
								lists.tsm[r.Id] = r;
							});
						});
				}
			}
		}
		setInterval(() => this.setTimeSinceLastModified(), 1000);
		setInterval(() => this.checkForUpdate(), 60000);

		if(localStorage.getItem('api_wowuction') !== null &&
			localStorage.getItem('api_wowuction') !== undefined &&
			localStorage.getItem('api_wowuction').length > 0 &&
			localStorage.getItem('api_wowuction') !== 'null' ) {
			if( new Date(localStorage.getItem('timestamp_wowuction')).toDateString() !== new Date().toDateString()) {
				console.log('Downloading wowuction data');
				this.auctionService.getWoWuctionData().subscribe(res => {
					lists.wowuction = res;
				});
			} else {
				console.log('Loading wowuction data from local storage');
				db.table('wowuction').toArray().then( r => {
					r.forEach(w => {
						lists.wowuction[w.id] = w;
					});
				});
			}
		}

		this.downloadingText = 'Downloading pets';
		this.petObserver = this.itemService.getPets()
			.subscribe(pets => {
				this.buildPetArray(pets['pets']);
				try {
					this.downloadingText = 'Downloading items';
					this.itemObserver = this.itemService.getItems()
						.subscribe(i => {
							this.buildItemArray(i);
						});
				} catch (err) {
					this.downloadingText = 'Failed at downloading items';
					console.log('Failed at loading items', err);
				}

			});
	}

	buildItemArray(arr) {
		if (lists.items === undefined) {
			lists.items = [];
		}

		let index = 0;
		for (let i of arr) {
			lists.items[i['id']] = i;
			if (i['itemSource']['sourceType'] === 'CREATED_BY_SPELL') {
				// Logic for adding new recipes
			}
			index++;
		}
		try {
			this.getAuctions();
		} catch (err) {
			console.log('Failed at loading auctions', err);
		}
		this.itemService.getRecipes()
			.subscribe(recipe => {
				let accepted = true;
				if (lists.recipes === undefined) {
					lists.recipes = [];
				}
				recipe.recipes.forEach(r => {
					if (r !== null && r['profession'] !== undefined && r['profession'] !== null) {
						r['estDemand'] = 0;
						lists.recipes.push(r);
					}
				});

			});
	}

	getAuctions(): void {
		lists.isDownloading = true;
		this.downloadingText = 'Checking for new auctions';
		console.log('Checking for new auction data');

		this.auctionService.getLastUpdated().subscribe(r => {
			this.downloadingText = 'Downloading auctions, this might take a while';
			console.log('Downloading auctions');
			if (parseInt(localStorage.getItem('timestamp_auctions'), 10) !== r['lastModified']) {
				this.auctionObserver = this.auctionService.getAuctions(r['url'].replace('\\', ''), r['lastModified'])
				.subscribe(a => {
					this.downloadingText = '';
					this.buildAuctionArray(a.auctions);
				});
			} else {
			this.downloadingText = 'Loading auctions from local storage';
				console.log('No new auction data available so loaded from local storage.');
				db.table('auctions').toArray().then(
					result => {
						this.downloadingText = '';
						this.buildAuctionArray(result);;
					});
			}
		});
	}

	buildAuctionArray(arr) {
		let list = [];
		lists.myAuctions = [];
		console.log('api to use: ' + user.apiToUse, lists[user.apiToUse]);
		for (let o of arr) {
			if (o['buyout'] === 0) {
				continue;
			}

			// TODO: this.numberOfAuctions++;
			if (lists.items[o.item] === undefined) {
				lists.items[o.item] = { 'id': o.item, 'name': 'Loading', 'icon': '' };
				o['name'] = 'Loading';
				this.getItem(o.item);
			} else {
				o['name'] = lists.items[o.item].name;
			}
			try {
				if (o.petSpeciesId !== undefined) {
					if (lists.pets[o.petSpeciesId] === null) {
						getPet(o.petSpeciesId);
					}
					o['name'] = this.getItemName(o);
				}
			} catch (e) { console.log(e); }

			if (user.apiToUse === 'wowuction' && lists.wowuction[o.item] !== undefined) {
				o['estDemand'] = Math.round(lists.wowuction[o.item]['estDemand'] * 100) || 0;
				o['avgDailySold'] = parseFloat(lists.wowuction[o.item]['avgDailySold']) || 0;
				o['avgDailyPosted'] = parseFloat(lists.wowuction[o.item]['avgDailyPosted']) || 0;
				o['mktPrice'] = lists.wowuction[o.item]['mktPrice'] || 0;

			} else if (user.apiToUse === 'tsm' && lists.tsm[o.item] !== undefined) {
				o['estDemand'] = Math.round(lists.tsm[o.item]['RegionSaleRate'] * 100) || 0;
				o['avgDailySold'] = parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) || 0;
				o['avgDailyPosted'] = Math.round(
					(parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) / parseFloat(lists.tsm[o.item]['RegionSaleRate'])) * 100) / 100 || 0;
				o['mktPrice'] = lists.tsm[o.item]['MarketValue'] || 0;

			} else {
				o['estDemand'] = 0;
				o['avgDailySold'] = 0;
				o['avgDailyPosted'] = 0;
				o['mktPrice'] = 0;
			}

			if (list[o.item] !== undefined) {

				list[o.item]['auctions'].push({
					'item': o.item, 'name': o.name,
					'petSpeciesId': o.petSpeciesId, 'owner': o.owner,
					'buyout': o.buyout, 'quantity': o.quantity
				});
				list[o.item]['quantity_total'] += o['quantity'];

				if (list[o.item]['buyout'] >
					o['buyout'] / o['quantity']) {

					list[o.item]['buyout'] = o['buyout'] / o['quantity'];
					list[o.item]['owner'] = o['owner'];
				} else if (list[o.item]['buyout'] / list[o.item]['auctions'][list[o.item]['auc']] ===
					o['buyout'] / o['quantity'] &&
					list[o.item]['owner'] !== o['owner']) {
					list[o.item]['owner'] += ', ' + o['owner'];
				}
			} else {
				o['quantity_total'] = o['quantity'];
				list[o.item] = o;
				list[o.item]['auctions'] = [];
				list[o.item]['auctions'].push({
					'item': o.item, 'name': o.name,
					'petSpeciesId': o.petSpeciesId, 'owner': o.owner,
					'buyout': o.buyout, 'quantity': o.quantity
				});
			}

			// Storing a users auctions in a list
			if (this.u.character !== undefined) {
				if (o.owner === this.u.character) {
					if (lists.myAuctions === undefined) {
						lists.myAuctions = [];
					}
					lists.myAuctions.push(o);
				}
			}
		}
		lists.auctions = list;
		this.getCraftingCosts();
		lists.isDownloading = false;
	}

	getItemName(auction): string {
		let itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
			return getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
		} else {
			if (lists.items[itemID] !== undefined) {
				if (lists.items[itemID]['name'] === 'Loading') {
					this.getItem(itemID);
				}
				return lists.items[itemID]['name'];
			}
		}
		return 'no item data';
	}

	getSize(list): number {
		let count = 0;
		for (let c of list) {
			count++;
		}
		return count;
	}

	getItem(id) {
		this.itemObserver = this.itemService.getItem(id)
			.subscribe(
			r => {
				lists.items[r['id']] = r;
		});
	}

	buildPetArray(pets) {
		let list = [];
		pets.forEach(p => {
			list[p.speciesId] = p;
		});
		lists.pets = list;
	}

	setTimeSinceLastModified() {
		this.date = new Date();

		let updateTime = new Date(this.lastModified).getMinutes(),
			currentTime = this.date.getMinutes(),
			oldTime = this.timeSinceLastModified;
		// Checking if there is a new update available
		if (this.timeDiff(updateTime, currentTime) < this.oldTimeDiff) {
			this.getAuctions();
		}

		this.timeSinceLastModified = this.timeDiff(updateTime, currentTime);
		this.oldTimeDiff = this.timeDiff(updateTime, currentTime);
	}

	timeDiff(updateTime, currentTime) {
		return (updateTime > currentTime ?
			(60 - updateTime + currentTime) : currentTime - updateTime);
	}

	exists(value): boolean {
		return value !== null && value !== undefined && value.length > 0;
	}

	isRealmSet(): boolean {
		return this.exists(localStorage.getItem('realm')) &&
			this.exists(localStorage.getItem('region'));
	}

	isCharacterSet(): boolean {
		return this.isRealmSet() && this.exists(user.character);
	}

	checkForUpdate() {
		if (this.isRealmSet()) {
			this.auctionService.getLastUpdated()
				.subscribe(r =>
					this.lastModified = r['lastModified']);
		}
	}

	getCraftingCosts(): void {
		for (let c of lists.recipes) {
			this.calcCost(c);
		}
		console.log('Done calculating crafting costs');
	}

	calcCost(c) {
		if (c !== null) {
			let matBuyout: number;
			c['cost'] = 0;
			c['buyout'] = 0;
			c['profit'] = 0;
			c['estDemand'] = 0;

			if(user.apiToUse === 'tsm') {
				c['estDemand'] = lists.tsm[c.itemID] !== undefined ?
					Math.round(lists.tsm[c.itemID]['RegionSaleRate'] * 100) : 0;
			} else if(user.apiToUse === 'wowuction') {
				c['estDemand'] = lists.wowuction[c.itemID] !== undefined ?
					Math.round(lists.wowuction[c.itemID]['estDemand'] * 100) : 0;
			}
			try {
				c.buyout = lists.auctions[c.itemID] !== undefined ?
					(lists.auctions[c.itemID].buyout) : 0;
				try {
					if (c.minCount < 1) {
						c.minCount = 1;
					}
					for (let m of c.reagents) {
						try {
							m.count = Math.round((m.count / c.minCount) * 100) / 100;
							matBuyout = lists.auctions[m.itemID] !== undefined ?
								(lists.auctions[m.itemID].buyout) :
								lists.customPrices[m.itemID] !== undefined ?
									lists.customPrices[m.itemID] : 0;
							c.cost += matBuyout !== 0 ? m.count * matBuyout : 0;
						} catch (errr) {
							console.log('Failed at calculating cost', errr);
							console.log(c);
						}
					}
				} catch (err) {
					console.log(err);
					console.log(c);
				}
				c.profit = c.buyout - c.cost;
			} catch (e) {
				console.log(e);
				console.log(c);
			}
		}
	}
}
