import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuctionService } from './services/auctions';
import { CharacterService } from './services/character.service';
import { ItemService } from './services/item';
import { calcCost, user, lists, getPet, db, copperToArray } from './utils/globals';
import { IUser } from './utils/interfaces';
import Push from 'push.js';

declare const  ga: Function;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [AuctionService]
})
export class AppComponent implements OnInit {
	// http://realfavicongenerator.net/
	downloadingText = '';
	private lastModified: number;
	timeSinceLastModified: number;
	private oldTimeDiff: number;
	private date: Date;
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};
	private u: IUser;
	private allItemSources = [];

	constructor(private auctionService: AuctionService,
		private itemService: ItemService, private characterService: CharacterService,
		private router: Router) {
		// Google Analytics
		router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd &&
				router.url !== '/' &&
				window.location.hostname !== 'localhost') {
				ga('set', 'page', router.url);
				ga('send', 'pageview');
			}
		});

		try {
			// Just for fun :)
			if (localStorage.getItem('darkMode') !== null && localStorage.getItem('darkMode') === 'false') {
				document
					.getElementById('custom-style')
					.setAttribute('href', 'assets/paper.bootstrap.min.css');
			}
		} catch (err) {
			console.log('style', err);
		}
	}

	ngOnInit() {
		this.date = new Date();
		if (this.isRealmSet()) {
			// Loading user settings
			try {
				user.region = localStorage.getItem('region') || undefined;
				user.realm = localStorage.getItem('realm') || undefined;
				user.character = localStorage.getItem('character') || undefined;
				user.apiTsm = localStorage.getItem('api_tsm') || undefined;
				user.apiWoWu = localStorage.getItem('api_wowuction') || undefined;
				user.customPrices = JSON.parse(localStorage.getItem('custom_prices')) || undefined;
				user.apiToUse = localStorage.getItem('api_to_use') || 'none';
				user.buyoutLimit = parseFloat(localStorage.getItem('crafting_buyout_limit')) || 200;
				user.crafters = localStorage.getItem('crafters') ? localStorage.getItem('crafters').split(',') : [];
				if (localStorage.getItem('crafters_recipes')  !== null && localStorage.getItem('crafters_recipes') !== undefined) {
					lists.myRecipes = localStorage.getItem('crafters_recipes').split(',');
				} else if (user.crafters.length > 0) {
					// Downloading the users characters recipes if crafters are set but recipes aren't
					this.downloadingText = 'Starting to download your characters recipes';
					this.characterService.getCharacters().subscribe(recipes => {
						console.log(recipes);
						if (typeof recipes.recipes === 'object') {
							Object.keys(recipes.recipes).forEach(v => {
								lists.myRecipes.push(recipes.recipes[v]);
							});
						} else {
							lists.myRecipes = recipes.recipes;
						}
						localStorage.setItem('crafters_recipes', lists.myRecipes.toString());
					}, e => {
						console.log('Were unable to download user recipes', e);
					});
				}

				if (localStorage.getItem('watchlist') !== null &&
					localStorage.getItem('watchlist') !== undefined) {
					user.watchlist = JSON.parse(localStorage.getItem('watchlist'));
					console.log('watchlist:',user.watchlist);
				}
			} catch (e) {
				console.log('app.component init', e);
			}

			this.checkForUpdate();
			if (
				user.apiToUse === 'tsm' &&
				localStorage.getItem('api_tsm') !== null &&
				localStorage.getItem('api_tsm') !== undefined &&
				localStorage.getItem('api_tsm').length > 0 &&
				localStorage.getItem('api_tsm') !== 'null') {
				if (new Date(localStorage.getItem('timestamp_tsm')).toDateString() !== new Date().toDateString()) {
					this.auctionService.getTSMData().subscribe(result => {
						result.forEach(r => {
							lists.tsm[r.Id] = r;
						});
					}, err => {
						console.log(err);
					});
					console.log('TSM done');

					if (user.apiToUse === 'tsm') {
						this.downloadPets();
					}
				} else {
					console.log('Loaded TSM from local DB');
					db.table('tsm').toArray().then(
						result => {
							result.forEach(r => {
								lists.tsm[r.Id] = r;
							});
						});

					if (user.apiToUse === 'tsm') {
						this.downloadPets();
					}
				}
			}
		}
		setInterval(() => this.setTimeSinceLastModified(), 1000);
		setInterval(() => this.checkForUpdate(), 60000);

		if (
			user.apiToUse === 'wowuction' &&
			localStorage.getItem('api_wowuction') !== null &&
			localStorage.getItem('api_wowuction') !== undefined &&
			localStorage.getItem('api_wowuction').length > 0 &&
			localStorage.getItem('api_wowuction') !== 'null') {
			if (new Date(localStorage.getItem('timestamp_wowuction')).toDateString() !== new Date().toDateString()) {
				console.log('Downloading wowuction data');
				this.auctionService.getWoWuctionData().subscribe(res => {
					res.forEach(r => {
						lists.wowuction[r.id] = r;
					});

					if (user.apiToUse === 'wowuction') {
						this.downloadPets();
					}
				});
			} else {
				console.log('Loading wowuction data from local storage');
				db.table('wowuction').toArray().then(r => {
					r.forEach(w => {
						lists.wowuction[w.id] = w;
					});

					if (user.apiToUse === 'wowuction') {
						this.downloadPets();
					}
				});
			}
		}

		if (user.apiToUse === 'none') {
			this.downloadPets();
		}

		if (localStorage.getItem('custom_prices') !== null) {
			lists.customPrices = JSON.parse(localStorage.getItem('custom_prices'));
		}
	}

	downloadPets() {
		db.table('pets').toArray().then(pets => {
			if (pets.length > 0) {
				this.buildPetArray(pets);
				this.downloadItems();
			} else {
				this.downloadingText = 'Downloading pets';
				this.itemService.getPets()
					.subscribe(p => {
						this.buildPetArray(p);
						this.downloadItems();
					});
			}
		});
	}

	downloadItems() {
		try {
			this.downloadingText = 'Downloading items';
			// Attempting to get from local storage
			if (
				localStorage.getItem('timestamp_items') === null ||
				localStorage.getItem('timestamp_items') === undefined ||
				localStorage.getItem('timestamp_items') !== new Date().toDateString()) {
				// The db was empty so we're downloading
				this.itemService.getItems()
					.subscribe(iDL => {
						this.buildItemArray(iDL);
					});
			} else {
				db.table('items').toArray().then(i => {
					if (i.length > 0) {
						this.buildItemArray(i);
					} else {
						// The db was empty so we're downloading
						this.itemService.getItems()
							.subscribe(iDL => {
								this.buildItemArray(iDL);
							});
					}
				});
			}

		} catch (err) {
			this.downloadingText = 'Failed at downloading items';
			console.log('Failed at loading items', err);
		}
	}

	buildItemArray(arr) {
		if (lists.items === undefined) {
			lists.items = [];
		}

		let index = 0;
		for (let i of arr) {
			lists.items[i['id']] = i;
			if (i['itemSource']['sourceType'] === 'CREATED_BY_SPELL') {
				// TODO: Logic for adding new recipes
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
					if (r !== null && r !== undefined && r['profession'] !== undefined && r['profession'] !== null) {
						r['estDemand'] = 0;
						lists.recipesIndex[r.spellID] = lists.recipes.push(r) - 1;
						if (!lists.itemRecipes[r.itemID]) {
							lists.itemRecipes[r.itemID] = [];
						}
						lists.itemRecipes[r.itemID].push(r.spellID);
					}
				});
				// this.attemptDownloadOfMissingRecipes(recipe.recipes);
			});
	}

	public getAuctions(): void {
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
						if (result.length > 0) {
							this.buildAuctionArray(result);
						} else {
							localStorage.setItem('timestamp_auctions', '0');
							this.getAuctions();
						}
					});
			}
		});
	}

	buildAuctionArray(arr) {
		let list = [], undercuttedAuctions = 0, itemsBelowVendor = {quantity: 0, totalValue: 0};

		lists.myAuctions = [];
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
					if (lists.pets[o.petSpeciesId] === null || lists.pets[o.petSpeciesId] === undefined) {
						getPet(o.petSpeciesId, this.itemService);
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
				try {
					o['estDemand'] = Math.round(lists.tsm[o.item]['RegionSaleRate'] * 100) || 0;
					o['avgDailySold'] = parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) || 0;
					o['avgDailyPosted'] = Math.round(
						(parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) / parseFloat(lists.tsm[o.item]['RegionSaleRate'])) * 100) / 100 || 0;
					o['mktPrice'] = lists.tsm[o.item]['MarketValue'] || 0;
					o['regionSaleAvg'] = lists.tsm[o.item].RegionSaleAvg;
					o['vendorSell'] = lists.tsm[o.item].VendorSell;
				} catch (err) {
					console.log(err);
				}

			} else {
				o['estDemand'] = 0;
				o['avgDailySold'] = 0;
				o['avgDailyPosted'] = 0;
				o['mktPrice'] = 0;
			}

			if (list[o.item] !== undefined) {

				list[o.item]['auctions'].push({
					'item': o.item, 'name': o.name, 'petSpeciesId': o.petSpeciesId,
					'owner': o.owner, 'ownerRealm': o.ownerRealm,
					'buyout': o.buyout, 'quantity': o.quantity,
					'bid': o.bid
				});
				list[o.item]['quantity_total'] += o['quantity'];

				if (list[o.item]['buyout'] > o['buyout'] / o['quantity']) {

					list[o.item]['buyout'] = o['buyout'] / o['quantity'];
					list[o.item]['bid'] = o['bid'] / o['quantity'];
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
					'item': o.item, 'name': o.name, 'petSpeciesId': o.petSpeciesId,
					'owner': o.owner, 'ownerRealm': o.ownerRealm,
					'buyout': o.buyout, 'quantity': o.quantity,
					'bid': o.bid
				});
			}

			// Storing a users auctions in a list
			if (user.character !== undefined) {
				if (o.owner === user.character) {
					if (lists.myAuctions === undefined) {
						lists.myAuctions = [];
					}
					lists.myAuctions.push(o);
				}
			}
			// Gathering data for auctions below vendor price
			if (lists.items[o.item] !== undefined && o.buyout < lists.items[o.item].sellPrice) {
				console.log(true);
				itemsBelowVendor.quantity++;
				itemsBelowVendor.totalValue += (lists.items[o.item].sellPrice - o.buyout) * o.quantity;
			}
			// TODO: this.addToContextList(o);
		}
		if (itemsBelowVendor.quantity > 0) {
			this.notification(
				`${itemsBelowVendor.quantity} items have been found below vendor sell!`,
				`Potential profit: ${copperToArray(itemsBelowVendor.totalValue)}`, 'auctions');
		}

		if (user.character !== undefined) {
			// Notifying the user if they have been undercutted or not
			lists.myAuctions.forEach(a => {
				if (lists.auctions[a.item] !== undefined && lists.auctions[a.item].owner !== user.character) {
					undercuttedAuctions++;
					console.log(`${lists.auctions[a.item].owner} !== ${user.character}`);
				}

			});
			if (undercuttedAuctions > 0) {
				this.notification(
					'You have been undercutted!',
					`${undercuttedAuctions} of your ${lists.myAuctions.length} auctions have been undercutted.`, 'my-auctions');
			}
		}

		lists.auctions = list;
		this.getCraftingCosts();
		lists.isDownloading = false;
	}

	attemptDownloadOfMissingRecipes(list): void {
		let recipes = {};
		list.forEach(re => {
			if (re !== null) {
				recipes[re.spellID] = re.spellID;
			}
		});

		for (let i in lists.items) {
			if (lists.items[i].itemSource.sourceType === 'CREATED_BY_SPELL' &&
				recipes[lists.items[i].itemSource.sourceId] === undefined) {
				console.log('Attempting to add ' + lists.items[i].name);
				this.itemService.getRecipe(lists.items[i].id).subscribe(shit => {
					console.log(i);
				});
			}
		}
	}

	getItemName(auction): string {
		const itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = getPet(auction.petSpeciesId, this.itemService).name + ' @' + auction.petLevel;
			return auction['name'];
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
			this.notification('New auction data is available!', `Downloading new auctions for ${user.realm}@${user.region}.`);
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
		let potentialProfit = 0;
		console.log('starting crafting cost calc');
		for (let c of lists.recipes) {
			calcCost(c);
			if (c.profit > 0) {
				potentialProfit += c.profit;
			}
		}
		console.log('Done calculating crafting costs');
		// checking if watchlist gives any alerts
		let watchlistAlerts = 0, tmpList = [];
		lists.myRecipes.forEach( recipeID => {
			tmpList[recipeID] = 'owned';
		});
		Object.keys(user.watchlist.items).forEach(group => {
			user.watchlist.items[group].forEach(item => {
				if (item.criteria === 'below' && lists.auctions[item.id].buyout <= item.value) {
					watchlistAlerts++;
				} else if (lists.itemRecipes[item.id]) {
					lists.itemRecipes[item.id].forEach(r => {
						if (tmpList[r] &&
							lists.recipes[lists.recipesIndex[r]].profit /
							lists.recipes[lists.recipesIndex[r]].buyout > item.minCraftProfit / 100) {
							watchlistAlerts++;
						}
					});
				}
			});
		});
		if (watchlistAlerts > 0) {
			this.notification(
				`Watchlist items!`,
				`There are ${watchlistAlerts} items meet your criteria.`, 'watchlist');
		}
	}

	/**
	 * Used to add item to the list of available contexts for an auction item
	 * @param {[type]} o - Auction item
	 */
	addToContextList(o): void {
		switch (o.context) {
			case 0:
				this.allItemSources[o.context] = 'Drop'
				break;
			case 1:
				this.allItemSources[o.context] = 'World drop'
				break;
			case 2:
				this.allItemSources[o.context] = 'Raid (old)'
				break;
			case 3:
				this.allItemSources[o.context] = 'Normal dungeon';
				break;
			case 4:
				this.allItemSources[o.context] = 'Raid finder';
				break;
			case 5:
				this.allItemSources[o.context] = 'Heroic';
				break;
			case 6:
				this.allItemSources[o.context] = 'Mythic';
				break;
			case 7:
				this.allItemSources[o.context] = 'Player drop';
				break;
			case 9:
				this.allItemSources[o.context] = 'Gathering';
				break;
			case 11:
				this.allItemSources[o.context] = 'Drop';
				break;
			case 13:
				this.allItemSources[o.context] = 'Profession';
				break;
			case 14:
				this.allItemSources[o.context] = 'Vendor';
				break;
			case 15:
				this.allItemSources[o.context] = 'Vendor';
				break;
			case 22:
				this.allItemSources[o.context] = 'Timewalking';
				break;
			case 23:
				this.allItemSources[o.context] = 'Trash drop';
				break;
			case 25:
				this.allItemSources[o.context] = 'World drop';
				break;
			case 26:
				this.allItemSources[o.context] = 'World drop';
				break;
			case 30:
				this.allItemSources[o.context] = 'Mythic dungeon';
				break;
			case 31:
				this.allItemSources[o.context] = 'Garrison mission';
				break;
			default:
				this.allItemSources[o.context] = o.context + ' - ' + o.item + ' - ' + o.name;
				break;
		}
	}

	notification(title: string, message: string, page?: string) {
		console.log(title, message);
		Push.create(title, {
			body: message,
			icon: 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg',
			timeout: 10000,
			onClick: () => {
				if (page) {
					this.router.navigateByUrl(page);
				}
				window.focus();
				close();
			}
		});
	}
}
