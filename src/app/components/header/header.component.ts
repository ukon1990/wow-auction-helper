import { Component, Input } from '@angular/core';
import { user } from 'app/utils/globals';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent {
	exists(value): boolean {
		return value !== null && value !== undefined && value.length > 0;
	}

	isRealmSet(): boolean {
		return this.exists(localStorage.getItem('realm')) &&
			this.exists(localStorage.getItem('region'));
	}

	isCharacterSet(): boolean {
		return user && this.isRealmSet() && this.exists(user.character);
	}

	isSmallWindow(): boolean {
		return window.innerWidth < 768;
	}
}
