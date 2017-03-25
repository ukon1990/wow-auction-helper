import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { IUser } from '../../utils/interfaces';
import { user, lists, copperToArray } from '../../utils/globals';

@Component({
	selector: 'settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {
	private user: IUser;
	private customPrices = [];
	private importedSettings: string;
	private exportedSettings: string;
	private originalRealm: string;
	private darkMode = true;

	constructor(private ac: AppComponent) {
		this.user = user;
		Object.keys(lists.customPrices).forEach(k => {
			this.customPrices.push({
				'itemID': k,
				'name': lists.items[k] !== undefined ? lists.items[k].name : 'undefined',
				'price': lists.customPrices[k]});
		});

		if(localStorage.getItem('darkMode') !== null) {
			this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
		}
		this.originalRealm = localStorage.getItem('realm');
	}

	saveUserData(): void {
		console.log(this.user, this.user.apiToUse);
		localStorage.setItem('region', this.user.region);
		localStorage.setItem('realm', this.user.realm);
		localStorage.setItem('character', this.user.character);
		localStorage.setItem('api_tsm', this.user.apiTsm);
		localStorage.setItem('api_wowuction', this.user.apiWoWu);
		localStorage.setItem('api_to_use', this.user.apiToUse);

		if(this.originalRealm !== this.user.realm) {
			console.log('The realm is chagned. The old realm was ' +
				this.originalRealm + ' and new realm is ' +
				this.user.realm + '. Downloading new auction data.');
			localStorage.setItem('timestamp_auctions', '0');
			this.downloadAuctions();
		}
		/*
		TODO: Later...
		lists.customPrices = [];
		this.customPrices.forEach(cp => {
			if(cp !== null) {
				console.log(cp);
				lists.customPrices['"' + cp.itemID + '"'] = cp.price;
			}
		});
		console.log(lists.customPrices);*/
		// localStorage.setItem('custom_prices', JSON.stringify(lists.customPrices));
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

	copperToArray = copperToArray;
}
