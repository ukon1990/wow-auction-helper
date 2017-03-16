import { Component } from '@angular/core';
import { IUser } from '../../utils/interfaces';
import { user, lists } from '../../utils/globals';

@Component({
	selector: 'settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {
	private user: IUser;
	private customPrices = [];
	private importedSettings: string;
	private exportedSettings: string;

	constructor() {
		this.user = user;
		this.customPrices = lists.customPrices;
	}

	saveUserData(): void {
		localStorage.setItem('region', this.user.region);
		localStorage.setItem('realm', this.user.realm);
		localStorage.setItem('character', this.user.character);
		localStorage.setItem('api_tsm', this.user.apiTsm);
		localStorage.setItem('api_wowuction', this.user.apiWoWu);
	}

	importUserData(): void {
		this.user = JSON.parse(this.importedSettings);
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
	}
}
