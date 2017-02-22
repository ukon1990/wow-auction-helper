import { Component, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router } from '@angular/router';
import { user } from '../../utils/globals';
import { RealmService } from '../../services/realm';

@Component({
	selector: 'selector',
	templateUrl: 'front.page.component.html',
	providers: [RealmService]
})
export class FrontPageComponent {
	private u;
	private realmListEu = [];
	private realmListUs = [];

	constructor(private router: Router, private rs: RealmService) {
		this.u = user;
	}

	ngOnInit(): void {
		this.rs.getRealms().subscribe(
			r => {
				this.realmListEu = r.region.eu;
				this.realmListUs = r.region.us;
			});
		console.log('dasda', localStorage.getItem('region'));
		if(localStorage.getItem('realm') !== null && localStorage.getItem('region') !== null) {
			this.router.navigateByUrl('/auctions');
		}
	}

	getRealms() {
		if(this.u.region === 'us') {
			return this.realmListUs['realms'] || [];
		} else {
			return this.realmListEu['realms'] || [];
		}
	}

	nextPage() {
		localStorage.setItem('region', this.u.region);
		localStorage.setItem('realm', this.u.realm);
		localStorage.setItem('charater', this.u.character);
		localStorage.setItem('apiTsm', this.u.apiTsm);
		localStorage.setItem('apiWoWu', this.u.apiWoWu);
		this.router.navigateByUrl('/auctions');
	}

	getRealmValue(realm): void {
		this.u.realm = realm;
		console.log('realm: ' + realm);
	}

}
