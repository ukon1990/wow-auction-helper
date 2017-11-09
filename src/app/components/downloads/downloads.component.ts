import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-downloads',
	templateUrl: './downloads.component.html',
	styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {

	@Input() timeSinceLastModified: any;
	pageLoadTimestamp: Date = new Date();
	showDropdown: boolean;
	constructor() { }

	ngOnInit() {
	}

	getTimestamp(type: string): any {
		return localStorage[`timestamp_${type}`]
	}

}
