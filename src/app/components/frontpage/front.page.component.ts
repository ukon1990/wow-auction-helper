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

	ngOnInit() {
		if(this.u.realm !== undefined && this.u.region !== undefined){
			this.nextPage();
		}
	}

	nextPage(){
		localStorage.setItem('region', user.region);
		localStorage.setItem('realm', user.realm);
		localStorage.setItem('charater', user.character);
		this.router.navigateByUrl('/auctions');
	}

}