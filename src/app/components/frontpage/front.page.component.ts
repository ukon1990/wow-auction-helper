import { Component, OnInit } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Router } from '@angular/router';
import { user } from '../../utils/globals';

@Component({
	selector: 'selector',
	templateUrl: 'front.page.component.html'
})
export class FrontPageComponent {
	private u;
	constructor(private router: Router) { 
		this.u = user;
	}

	ngOnInit(): void {
		if(this.u.realm !== undefined && this.u.region !== undefined){
			this.router.navigateByUrl('/auctions');
		}
	}

	nextPage() {
		localStorage.setItem('region', this.u.region);
		localStorage.setItem('realm', this.u.realm);
		localStorage.setItem('charater', this.u.character);
		this.router.navigateByUrl('/auctions');
	}

}