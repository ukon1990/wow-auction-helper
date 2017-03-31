import { Component, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router } from '@angular/router';
import { user } from '../../utils/globals';
import { RealmService } from '../../services/realm';
import { Title }     from '@angular/platform-browser';

@Component({
	selector: 'selector',
	templateUrl: 'front.page.component.html',
	providers: [RealmService]
})
export class FrontPageComponent {
	u;
	realmListEu = [];
	realmListUs = [];

	constructor(private router: Router, private titleService: Title, private rs: RealmService) {
		this.u = user;
		this.titleService.setTitle('Wah - Setup');
	}

	ngOnInit(): void {
		this.rs.getRealms().subscribe(
			r => {
				this.realmListEu = r.region.eu;
				this.realmListUs = r.region.us;
			});
		if(localStorage.getItem('realm') !== null && localStorage.getItem('region') !== null) {
			this.router.navigateByUrl('/crafting');
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
		localStorage.setItem('character', this.u.character);
		localStorage.setItem('api_tsm', this.u.apiTsm);
		localStorage.setItem('api_wowuction', this.u.apiWoWu);
		if(this.u.apiTsm.length > 0) {
			localStorage.setItem('api_to_use', 'tsm');
		} else if(this.u.apiWoWu.length > 0) {
			localStorage.setItem('api_to_use', 'wowuction');
		}else {
			localStorage.setItem('api_to_use', 'none');
		}
		this.router.navigateByUrl('/crafting');
		location.reload();
	}

	getRealmValue(realm): void {
		this.u.realm = realm;
		console.log('realm: ' + realm);
	}

}
