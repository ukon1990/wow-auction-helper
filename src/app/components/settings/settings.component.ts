import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { RealmService } from '../../services/realm';
import { AuctionService } from '../../services/auctions';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';
import { IUser } from '../../utils/interfaces';
import { user, lists, copperToArray, db, setRecipesForCharacter } from '../../utils/globals';

@Component({
	selector: 'app-settings',
	templateUrl: 'settings.component.html',
	styleUrls: ['../../app.component.css'],
	providers: [RealmService, AuctionService]
})
export class SettingsComponent implements OnInit {
	user: IUser;
	customPriceForm: FormGroup;
	userCrafterForm: FormGroup;
	customPrices = [];
	newCustomPrice = {'itemID': 0};
	customPriceSearchQuery: string;
	customPriceQueryItems = [];
	realmListEu = [];
	realmListUs = [];
	importedSettings: string;
	exportedSettings: string;
	originalRealm: string;
	userCrafter: string;
	userCraftersChanged = false;
	userCraftersDownloading = false;
	darkMode = true;
	tabIndex = 0;
	tabs = [
		{name: 'Realm, Seller & API', path: ''},
		{name: 'Crafting', path: 'crafting'},
		{name: 'Notifications', path: 'notifications'}
	];

	constructor(private ac: AppComponent, private titleService: Title, private formBuilder: FormBuilder,
		private rs: RealmService, private auctionService: AuctionService, private characterService: CharacterService) {
		this.user = user;
		this.customPriceForm = formBuilder.group({
			'query': ''
		});
		this.userCrafterForm = formBuilder.group({
			'query': ''
		});

		Object.keys(lists.customPrices).forEach(k => {
			this.customPrices.push({
				'itemID': k,
				'name': lists.items[k] !== undefined ? lists.items[k].name : 'undefined',
				'price': lists.customPrices[k]});
		});

		if (localStorage.getItem('darkMode') !== null) {
			this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
		}
		this.originalRealm = localStorage.getItem('realm');
		this.titleService.setTitle('Wah - Settings');
	}

	ngOnInit(): void {
		this.rs.getRealms().subscribe(
			r => {
				this.realmListEu = r.region.eu;
				this.realmListUs = r.region.us;
			});
	}

	getRealms() {
		if (this.user.region === 'us') {
			return this.realmListUs['realms'] || [];
		} else {
			return this.realmListEu['realms'] || [];
		}
	}

	getCharacter(character: string, realm: string, index?: number) {
		if (this.user.characters[index]) {
			this.user.characters[index].downloading = true;
			if (user.region === 'us') {
				this.realmListUs['realms'].forEach(r => {
					if (r.name === realm) {
						realm = r.slug;
					}
				});
			} else if (user.region === 'eu') {
				this.realmListEu['realms'].forEach(r => {
					if (r.name === realm) {
						realm = r.slug;
					}
				});
			}
		}

		this.characterService.getCharacter(character, realm)
			.subscribe(c => {
				if (this.user.characters[index]) {
					this.user.characters[index] = c;
					user.characters[index] = c;
					setRecipesForCharacter(c);
				} else {
					user.characters.push(c);
					setRecipesForCharacter(c);
				}
				localStorage.characters = JSON.stringify(user.characters);
				lists.myRecipes = Array.from(new Set(lists.myRecipes));
			}, error => {
				const updated = {
					name: character,
					realm: realm,
					error: {
						status: error.status,
						statusText: error.statusText
					}
				};
				if (!this.user.characters[index]) {
					user.characters.push(updated);
					this.user.characters.push(updated);
				} else {
					this.user.characters[index].downloading = false;
					user.characters[index].downloading = false;
				}
				localStorage.characters = JSON.stringify(user.characters);
				lists.myRecipes = Array.from(new Set(lists.myRecipes));
				console.log(`Unable to download character ${character} @ ${realm}`, error);
			});
	}

	saveUserData(): void {
		const oldTSMKey = localStorage.getItem('api_tsm') || '';
		localStorage.setItem('region', this.user.region);
		localStorage.setItem('realm', this.user.realm);
		localStorage.setItem('character', this.user.character);
		localStorage.setItem('api_tsm', this.user.apiTsm);
		localStorage.setItem('api_wowuction', this.user.apiWoWu);
		localStorage.setItem('api_to_use', this.user.apiToUse);
		localStorage.setItem('crafters', this.user.crafters.toString());

		this.customPrices.forEach(cp => {
			if (cp.itemID !== null) {
				lists.customPrices[cp.itemID] = cp.price;
			}
		});
		localStorage.setItem('custom_prices', JSON.stringify(lists.customPrices));

		if (localStorage.getItem('crafting_buyout_limit') !== this.user.buyoutLimit.toString()) {
			this.ac.getCraftingCosts();
			localStorage.setItem('crafting_buyout_limit', this.user.buyoutLimit.toString());
		}

		if (this.originalRealm !== this.user.realm) {
			console.log('The realm is chagned. The old realm was ' +
				this.originalRealm + ' and new realm is ' +
				this.user.realm + '. Downloading new auction data.');

			this.ac.downloadingText = 'Downloading TSM data for the new realm';
			this.auctionService.getTSMData().subscribe(result => {
				result.forEach( r => {
					lists.tsm[r.Id] = r;
				});
				// Downloading the auctions
				localStorage.setItem('timestamp_auctions', '0');
				this.downloadAuctions();
			}, err => {
				console.log(err);
			});
		} else if (oldTSMKey !== localStorage.getItem('api_tsm')) {
			this.ac.downloadingText = 'Downloading TSM data for the new realm';
			this.auctionService.getTSMData().subscribe(result => {
				result.forEach( r => {
					lists.tsm[r.Id] = r;
					db.table('auctions').toArray().then(a => {
						this.ac.buildAuctionArray(a);
					});
				});
			}, err => {
				console.log(err);
			});
		} else {
			db.table('auctions').toArray().then(a => {
				this.ac.buildAuctionArray(a);
			});
		}

		this.updateRecipesForRealm();
	}

	importUserData(): void {
		this.user = JSON.parse(this.importedSettings);
		this.saveUserData();
	}

	exportUserData(): void {
		this.exportedSettings = JSON.stringify(user);
	}

	deleteUserData(): void {
		localStorage.removeItem('region');
		user.region = undefined;
		localStorage.removeItem('realm');
		user.realm = undefined;
		localStorage.removeItem('character');
		user.character = undefined;
		localStorage.removeItem('api_tsm');
		user.apiTsm = undefined;
		localStorage.removeItem('api_wowuction');
		user.apiWoWu = undefined;
		localStorage.removeItem('api_to_use');
		user.apiToUse = undefined;
		localStorage.removeItem('crafting_buyout_limit');
		user.buyoutLimit = 200;
		localStorage.removeItem('crafters');
		user.crafters = [];
		localStorage.removeItem('crafters_recipes');
		lists.myRecipes = [];
		localStorage.removeItem('watchlist');
		user.watchlist = {recipes: {}, items: {}, groups: []};
	}

	changeStyle(): void {
		this.darkMode = !this.darkMode;
		document
			.getElementById('custom-style')
				.setAttribute('href',
					(this.darkMode ? 'assets/solar.bootstrap.min.css' : 'assets/paper.bootstrap.min'));
		localStorage.setItem('darkMode', this.darkMode.toString());
		location.reload();
	}

	downloadAuctions() {
		this.ac.getAuctions();
	}

	addCustomPrice(item: any): void {
		this.customPrices.push({
			'itemID': item.id,
			'name': item.name,
			'price': 20000});
	}

	searchDB() {
		db.table('items')
			.where('name')
			.startsWithIgnoreCase(this.customPriceForm.value['query'])
			.limit(2)
			.toArray()
			.then(i => {
				this.customPriceQueryItems = i;
			}, e => {
				console.log(e);
			});
	}

	removeCustomPrice(index: number): void {
		this.customPrices.splice(index, 1);
	}

	addCharacter() {
		let realmName = '',
			exists = false;
		const realmSlug = this.user.realm,
			character = this.userCrafterForm.value['query'];

		this.userCraftersChanged = true;
		if (user.region === 'us') {
			this.realmListUs['realms'].forEach(r => {
				if (r.slug === realmSlug) {
					realmName = r.name;
				}
			});
		} else if (user.region === 'eu') {
			this.realmListEu['realms'].forEach(r => {
				if (r.slug === realmSlug) {
					realmName = r.name;
				}
			});
		}
		this.user.characters.forEach(c => {
			if (c.name.toLowerCase() === character && (c.realm === realmName || c.realm === realmSlug)) {
				exists = true;
			}
		});
		if (!exists) {
			this.user.characters.push({
				name: character,
				realm: realmName,
				downloading: true
			});
			this.getCharacter(
				character,
				realmSlug,
				this.user.characters.length - 1);
		}
		this.userCrafterForm.value['query'] = '';
	}

	removeCharacter(index: number): void {
		console.log('deleted');
		this.user.characters.splice(index, 1);
		this.updateRecipesForRealm();
		localStorage.characters = JSON.stringify(user.characters);
	}

	getMyRecipeCount(): number {
		return lists.myRecipes.length;
	}

	updateRecipesForRealm(): void {
		lists.myRecipes = [];
		this.user.characters.forEach(character => {
			setRecipesForCharacter(character);
		});
	}

	getItemName(itemID: string): string {
		if (lists.items[itemID] === undefined) {
			return 'undefined';
		} else {
			return lists.items[itemID].name;
		}
	}

	selectTab(index: number) {
		this.tabIndex = index;
	}

	copperToArray = copperToArray;
}
