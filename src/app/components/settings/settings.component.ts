import { Component } from '@angular/core';
import { user } from '../../utils/globals';

@Component({
	selector: 'settings',
	templateUrl: 'settings.component.html'
})
export class SettingsComponent {
	constructor() { }

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
		localStorage.removeItem('charater');
		user.character = undefined;
	}
}
