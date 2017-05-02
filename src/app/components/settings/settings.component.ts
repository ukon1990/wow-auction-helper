import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { RealmService } from '../../services/realm';
import { AuctionService } from '../../services/auctions';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';
import { IUser } from '../../utils/interfaces';
import { user, lists, copperToArray, db } from '../../utils/globals';

@Component({
	selector: 'app-settings',
	templateUrl: 'settings.component.html',
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

	saveUserData(): void {
		const oldTSMKey = localStorage.getItem('api_tsm') || '';
		localStorage.setItem('region', this.user.region);
		localStorage.setItem('realm', this.user.realm);
		localStorage.setItem('character', this.user.character);
		localStorage.setItem('api_tsm', this.user.apiTsm);
		localStorage.setItem('api_wowuction', this.user.apiWoWu);
		localStorage.setItem('api_to_use', this.user.apiToUse);
		localStorage.setItem('crafters', this.user.crafters.toString());

		if (this.userCraftersChanged && this.user.crafters !== undefined && this.user.crafters.length > 0) {
			this.getCraftersRecipes();
		}

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

	addCrafter() {
		this.userCraftersChanged = true;
		this.user.crafters.push(this.userCrafterForm.value['query']);
		this.userCrafterForm.value['query'] = '';
	}

	removeCrafter(index: number) {
		this.user.crafters.splice(index, 1);
	}

	getCraftersRecipes(): void {
		this.userCraftersDownloading = true;
		this.characterService.getCharacters().subscribe(recipes => {
			this.userCraftersDownloading = false;
			if (typeof recipes.recipes === 'object') {
				Object.keys(recipes.recipes).forEach(v => {
					lists.myRecipes.push(recipes.recipes[v]);
				});
			} else {
				lists.myRecipes = recipes.recipes;
			}
			localStorage.setItem('crafters_recipes', lists.myRecipes.toString());
		});
	}

	getItemName(itemID: string): string {
		if (lists.items[itemID] === undefined) {
			return 'undefined';
		} else {
			return lists.items[itemID].name;
		}
	}

	copperToArray = copperToArray;
}
