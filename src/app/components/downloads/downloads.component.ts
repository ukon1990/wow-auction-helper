import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-downloads',
	templateUrl: './downloads.component.html',
	styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {

	@Input() timeSinceLastModified: any;
	showDropdown: boolean;
	constructor() { }

	ngOnInit() {
	}

}
