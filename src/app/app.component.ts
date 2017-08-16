import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuctionService } from './services/auctions';
import { CharacterService } from './services/character.service';
import { ItemService } from './services/item';
import { calcCost, user, lists, getPet, db, copperToString, setRecipesForCharacter } from './utils/globals';
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
	private notificationsWorking = true;

	constructor(private auctionService: AuctionService,
		private itemService: ItemService, private characterService: CharacterService,
		private router: Router) {
		this.getRecipes();
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
				user.isDarkMode = false;
				document
					.getElementById('custom-style')
					.setAttribute('href', 'assets/paper.bootstrap.min.css');
			} else {
				user.isDarkMode = true;
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
				if (localStorage.region) {
					user.region = localStorage.region;
				}

				if (localStorage.realm) {
					user.realm = localStorage.realm;
				}
				if (localStorage.character) {
					user.character = localStorage.character;
				}

				if (localStorage.api_tsm) {
					user.apiTsm = localStorage.api_tsm;
				}

				if (localStorage.api_wowuction) {
					user.apiWoWu = localStorage.api_wowuction;
				}

				if (localStorage.custom_prices) {
					user.customPrices = JSON.parse(localStorage.custom_prices);
				}

				if (localStorage.api_to_use) {
					user.apiToUse = localStorage.api_to_use;
				}

				if (localStorage.crafting_buyout_limit) {
					user.buyoutLimit = parseFloat(localStorage.crafting_buyout_limit);
				}

				if (localStorage.crafters) {
					user.crafters = localStorage.crafters.split(',');
				}
				if (localStorage.characters) {
					user.characters = JSON.parse(localStorage.characters);
				}
				if (localStorage.crafters_recipes) {
					lists.myRecipes = localStorage.crafters_recipes.split(',');
				}
				if (localStorage.notifications) {
					user.notifications = JSON.parse(localStorage.notifications);
				}

				/**
				 * Used for initiating the download of characters and profession data
				 */
				if (user.crafters && user.characters.length < 1) {
					try {
						user.crafters.forEach(crafter => {
							this.characterService.getCharacter(crafter, user.realm)
								.subscribe(character => {
									user.characters.push(character);
									setRecipesForCharacter(character);
									localStorage.characters = JSON.stringify(user.characters);
									lists.myRecipes = Array.from(new Set(lists.myRecipes));
								}, error => {
									user.characters.push({
										name: crafter,
										realm: user.realm,
										error: {
											status: error.status,
											statusText: error.statusText
										}
									});
									localStorage.characters = JSON.stringify(user.characters);
									console.log(`Faied at downloading the character ${crafter}`, error);
								});
						});
					} catch (error) {
						console.log('Unable to loop crafters', error);
					}
				} else {
					try {
						user.characters.forEach(character => {
							if (character.error && character.error.status !== 404) {
								// Try again
								this.characterService.getCharacter(character.name, character.realm)
									.subscribe(c => {
										character = c;
										setRecipesForCharacter(c);
										lists.myRecipes = Array.from(new Set(lists.myRecipes));
										localStorage.characters = JSON.stringify(user.characters);
									}, error => {
										character.error = {
											status: error.status,
											statusText: error.statusText
										};
										localStorage.characters = JSON.stringify(user.characters);
										console.log(`Faied at downloading the character ${character.name}`, error);
									});
							} else {
								setRecipesForCharacter(character);
								lists.myRecipes = Array.from(new Set(lists.myRecipes));
							}
						});
					} catch (error) {
						console.log('Unable to loop through characters', error);
					}
				}

				if (localStorage.watchlist) {
					user.watchlist = JSON.parse(localStorage.watchlist);
					Object.keys(user.watchlist.items).forEach(k => {
						user.watchlist.items[k].forEach(w => {
							if (w.alert === undefined) {
								w['alert'] = true;
							}
						});
					});
					console.log('watchlist:', user.watchlist);
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
			} else if (
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
			} else {
				this.downloadPets();
			}
			setInterval(() => this.checkForUpdate(), 60000);

			if (localStorage.getItem('custom_prices') !== null) {
				lists.customPrices = JSON.parse(localStorage.getItem('custom_prices'));
			}
		}
	}

	downloadPets() {
		try {
			console.log('pets');
			db.table('pets').toArray().then(pets => {
				if (pets.length > 0) {
					this.buildPetArray(pets);
					this.downloadItems();
				} else {
					this.downloadingText = 'Downloading pets';
					lists.isDownloading = true;
					this.itemService.getPets()
						.subscribe(p => {
							lists.isDownloading = false;
							this.buildPetArray(p);
							this.downloadItems();
						}, error => {
							this.downloadingText = '';
							console.log('Unable to download pets:', error);
							lists.isDownloading = false;
						});
				}
			});
		} catch (error) {
			console.log('Failed loading pets', error);
		}
	}

	downloadItems() {
		try {
			lists.isDownloading = true;
			this.downloadingText = 'Downloading items';
			// Attempting to get from local storage
			if (
				localStorage.getItem('timestamp_items') === null ||
				localStorage.getItem('timestamp_items') === undefined ||
				localStorage.getItem('timestamp_items') !== new Date().toDateString()) {
				// The db was empty so we're downloading
				this.itemService.getItems()
					.subscribe(iDL => {
						lists.isDownloading = false;
						this.buildItemArray(iDL);
					});
			} else {
				db.table('items').toArray().then(i => {
					if (i.length > 0) {
						lists.isDownloading = false;
						this.buildItemArray(i);
					} else {
						// The db was empty so we're downloading
						this.itemService.getItems()
							.subscribe(iDL => {
								lists.isDownloading = false;
								this.buildItemArray(iDL);
							});
					}
				});
			}

		} catch (err) {
			this.downloadingText = 'Failed at downloading items';
			console.log('Failed at loading items', err);
			lists.isDownloading = false;
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
	}

	public getAuctions(): void {
		if (!lists.isDownloading) {
			lists.isDownloading = true;
			this.downloadingText = 'Checking for new auctions';

			this.downloadingText = 'Loading auctions from local storage';
			console.log('Loading auctions from local storage.');
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

			console.log('Checking for new auction data');
			this.downloadingText = 'Checking for new auction data';
			this.auctionService.getLastUpdated().subscribe(r => {
				if (parseInt(localStorage.getItem('timestamp_auctions'), 10) !== r['lastModified']) {
					console.log('Downloading auctions');
					this.downloadingText = 'Downloading auctions, this might take a while';
					this.auctionObserver = this.auctionService.getAuctions(r['url'].replace('\\', ''), r['lastModified'])
						.subscribe(a => {
							this.downloadingText = '';
							this.buildAuctionArray(a.auctions);
						}, error => {
						this.downloadingText = 'Could not download auctions at this time';
							setTimeout(() => {
								this.downloadingText = '';
							}, 5000);
							lists.isDownloading = false;
							console.log('Could not download auctions at this time', error);
						});
				}
			});
		}
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
			if (user.notifications.isBelowVendorSell && lists.items[o.item] !== undefined && o.buyout < lists.items[o.item].sellPrice) {
				itemsBelowVendor.quantity++;
				itemsBelowVendor.totalValue += (lists.items[o.item].sellPrice - o.buyout) * o.quantity;
			}
			// TODO: this.addToContextList(o);
		}
		if (user.notifications.isBelowVendorSell && itemsBelowVendor.quantity > 0) {
			this.notification(
				`${itemsBelowVendor.quantity} items have been found below vendor sell!`,
				`Potential profit: ${copperToString(itemsBelowVendor.totalValue)}`, 'auctions');
		}

		if (user.notifications.isUndercutted && user.character !== undefined) {
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
				this.itemService.getRecipeByItem(lists.items[i].id).subscribe(shit => {
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

		const updateTime = new Date(this.lastModified).getMinutes(),
			currentTime = this.date.getMinutes();

		// Checking if there is a new update available
		if (this.lastModified && this.lastModified > 0 && this.timeDiff(updateTime, currentTime) < this.oldTimeDiff && !lists.isDownloading) {
			if (user.notifications.isUpdateAvailable) {
				this.notification('New auction data is available!', `Downloading new auctions for ${user.realm}@${user.region}.`);
			}
			this.getAuctions();
		}

		this.timeSinceLastModified = this.timeDiff(updateTime, currentTime);
		this.oldTimeDiff = this.timeSinceLastModified;
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
		console.log('checking for update');
		if (this.isRealmSet()) {
			this.auctionService.getLastUpdated()
				.subscribe(r => {
					this.lastModified = r['lastModified'];
					this.setTimeSinceLastModified();
				});
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

		if (user.notifications.isWatchlist) {
			// checking if watchlist gives any alerts
			let watchlistAlerts = 0, tmpList = [];
			lists.myRecipes.forEach( recipeID => {
				tmpList[recipeID] = 'owned';
			});
			Object.keys(user.watchlist.items).forEach(group => {
				user.watchlist.items[group].forEach(item => {
					if ((item.alert === undefined || item.alert) &&
						(item.criteria === 'below' && lists.auctions[item.id].buyout <= item.value ||
						item.criteria === 'above' && lists.auctions[item.id].buyout >= item.value)) {
						watchlistAlerts++;
						this.notification(item.name, `Current lowest buyout at ${
							Math.round(100 - (item.value / lists.auctions[item.id].buyout) * 100)
						}% of the alert value!`, 'watchlist', lists.items[item.id].icon);
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
	}

	getRecipes(): void {
		this.itemService.getRecipes()
			.subscribe(recipe => {
				if (lists.recipes === undefined) {
					lists.recipes = [];
				}
				recipe.recipes.forEach(r => {
					if (r && r['profession']) {
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

	notification(title: string, message: string, page?: string, icon?: string) {
		console.log(title, message);
		if (!this.notificationsWorking) {
			return;
		}
		try {
			Push.create(title, {
				body: message,
				icon: icon ? `http://media.blizzard.com/wow/icons/56/${icon}.jpg` : 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg',
				timeout: 10000,
				onClick: () => {
					if (page) {
						this.router.navigateByUrl(page);
					}
					window.focus();
					close();
				}
			});
		} catch (error) {
			this.notificationsWorking = false;
			console.log(error);
		}
	}

	isSmallWindow(): boolean {
		return window.innerWidth < 768;
	}
}
