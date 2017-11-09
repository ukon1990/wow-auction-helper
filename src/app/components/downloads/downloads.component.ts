import { Component, OnInit, Input } from '@angular/core';
import Crafting from 'app/utils/crafting';
import Pets from 'app/utils/pets';
import { Item } from 'app/utils/item';
import Auctions from 'app/utils/auctions';
import { ItemService } from 'app/services/item.service';
import { AuctionService } from 'app/services/auctions.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-downloads',
	templateUrl: './downloads.component.html',
	styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {

	@Input() timeSinceLastModified: any;
	pageLoadTimestamp: Date = new Date();
	showDropdown: boolean;
	constructor(private itemService: ItemService, private auctionService: AuctionService, private router: Router) { }

	ngOnInit() {
	}

	getTimestamp(type: string): any {
		return localStorage[`timestamp_${type}`]
	}

	donloadRecipes(): void {
		Crafting.download(this.itemService);
	}

	downloadPets(): void {
		Pets.download(this.itemService);
	}

	downloadItems(): void {
		Item.download(this.itemService);
	}

	checkForUpdates(): void {
		Auctions.checkForUpdates(this.auctionService);
	}

	downloadAuctions(): void {
		Auctions.download(this.auctionService, this.router);
	}
}
