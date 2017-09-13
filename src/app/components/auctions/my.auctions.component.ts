import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { ParentAuctionComponent } from './parent.auctions.component';
import { IUser, IAuction } from '../../utils/interfaces';
import { user, lists, getPet, copperToString } from '../../utils/globals';
import { itemClasses } from '../../utils/objects';

declare const ga: Function;
@Component({
	selector: 'app-my-auctions',
	templateUrl: 'my.auctions.component.html',
	styleUrls: ['auctions.component.css']
})

export class MyAuctionsComponent extends ParentAuctionComponent {
	activeAuctions = 0;
	auctionsValue = 0;
	numberOfUndercuttedAuctions = 0;
	private buyOutAsc = true;


	constructor(private titleService: Title) {
		super();
		this.titleService.setTitle('Wah - My auctions');
	}

	/**
	 * Used toget the name of the owner of an auction
	 * @param  {string} itemID
	 * @return {string}        The owners name
	 */
	getAuctionOwner(itemID: string): string {
		return lists.auctions[itemID].owner;
	};


	/**
	 * Retrieves a list of the users auctions.
	 * @return {any[]}
	 */
	getAuctions (): any[] {
		this.auctionsValue = 0;
		this.numberOfUndercuttedAuctions = 0;
		if (lists.myAuctions !== undefined && lists.myAuctions.length > 0) {
			this.activeAuctions = lists.myAuctions.length;
			lists.myAuctions.forEach(
				a => {
					this.auctionsValue += a.buyout;
					if (this.getAuctionOwner(a.item) !== user.character) {
						this.numberOfUndercuttedAuctions++;
					}
				});
		}
		return lists.myAuctions;
	}

	sort(key: string): void {
		this.sorter.addKey(key);
		this.sorter.sort(lists.myAuctions);
	}
}
