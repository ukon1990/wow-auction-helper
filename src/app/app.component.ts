import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuctionService } from './services/auctions.service';
import { CharacterService } from './services/character.service';
import { ItemService } from './services/item.service';
import { user, lists, db, setRecipesForCharacter } from './utils/globals';
import { IUser } from './utils/interfaces';
import { GoldPipe } from './pipes/gold.pipe';
import Push from 'push.js';
import { Notification } from './utils/notification';
import Crafting from './utils/crafting';
import Pets from './utils/pets';
import Auctions from './utils/auctions';
import { Item } from './utils/item';

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

	async ngOnInit() {

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
						// TODO: this.downloadPets();
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
						// TODO: this.downloadPets();
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
							// TODO: this.downloadPets();
						}
					});
				} else {
					console.log('Loading wowuction data from local storage');
					db.table('wowuction').toArray().then(r => {
						r.forEach(w => {
							lists.wowuction[w.id] = w;
						});

						if (user.apiToUse === 'wowuction') {
							// TODO: this.downloadPets();
						}
					});
				}
			} else {
				// TODO: this.downloadPets();
			}

			await Crafting.download(this.itemService);
			await Pets.download(this.itemService);
			await Item.download(this.itemService);
			await Auctions.checkForUpdates(this.auctionService);
			await Auctions.download(this.auctionService, this.router);
			setInterval(() => this.checkForUpdate(), 60000);

			if (localStorage.getItem('custom_prices') !== null) {
				lists.customPrices = JSON.parse(localStorage.getItem('custom_prices'));
			}
		}
	}

	attemptDownloadOfMissingRecipes(list): void {
		const recipes = {};
		list.forEach(re => {
			if (re !== null) {
				recipes[re.spellID] = re.spellID;
			}
		});
	}


	getSize(list): number {
		let count = 0;
		for (const c of list) {
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

	setTimeSinceLastModified() {
		this.date = new Date();

		const updateTime = new Date(this.lastModified).getMinutes(),
			currentTime = this.date.getMinutes();

		// Checking if there is a new update available
		if (this.lastModified && this.lastModified > 0 && this.timeDiff(updateTime, currentTime) < this.oldTimeDiff && !lists.isDownloading) {
			if (user.notifications.isUpdateAvailable) {
				Notification.send('New auction data is available!', `Downloading new auctions for ${user.realm}@${user.region}.`, this.router);
			}
			Auctions.download(this.auctionService, this.router);
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
				.then(r => {
					this.lastModified = r['lastModified'];
					this.setTimeSinceLastModified();
				});
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

	isSmallWindow(): boolean {
		return window.innerWidth < 768;
	}
}
