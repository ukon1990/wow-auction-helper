import { Component, OnInit } from '@angular/core';
import { user } from '../../utils/globals';

@Component({
	selector: 'user',
	templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {
	u;
	constructor() {
		this.u = user;
	}

	ngOnInit() { }
}