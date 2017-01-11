import { Component } from '@angular/core';
import { IUser } from '../../utils/interfaces';
import { user } from '../../utils/globals';

@Component({
	selector: 'settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {
	private user: IUser;

	constructor() {
		this.user = user;
	}

	saveUserData(): void {
		localStorage.setItem('region', this.user.region);
		localStorage.setItem('realm', this.user.realm);
		localStorage.setItem('character', this.user.character);
		localStorage.setItem('apiTsm', this.user.apiTsm);
		localStorage.setItem('apiWoWu', this.user.apiWoWu);
	}

	importUserData(): void {
		// TODO:
		console.log('Not yet implemented!');
	}

	exportUserData(): void {
		// TODO:
		console.log('Not yet implemented!');
		console.log(JSON.stringify(user));
	}

	deleteUserData(): void {
		localStorage.removeItem('region');
		user.region = undefined;
		localStorage.removeItem('realm');
		user.realm = undefined;
		localStorage.removeItem('character');
		user.character = undefined;
		localStorage.removeItem('apiTsm');
		user.apiTsm = undefined;
		localStorage.removeItem('apiWoWu');
		user.apiWoWu = undefined;
	}
}
