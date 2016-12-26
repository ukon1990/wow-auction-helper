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

	ngOnInit() { }

	nextPage(){
		this.router.navigateByUrl('/auctions');
	}

}