import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { ParentAuctionComponent } from './parent.auctions.component';
import { IUser, IAuction } from '../../utils/interfaces';
import { user, itemClasses, lists, getPet, copperToArray } from '../../utils/globals';



@Component({
	selector: 'my-auctions',
	templateUrl: 'my.auctions.component.html',
	styleUrls: ['auctions.component.css']
})

export class MyAuctionsComponent extends ParentAuctionComponent {
	activeAuctions = 0;
	auctionsValue = 0;
	numberOfUndercuttedAuctions: number = 0;
	private buyOutAsc: boolean = true;


	constructor(private titleService: Title) {
		super();
		this.titleService.setTitle('Wah - My auctions');
	}

	getAuctionOwner(itemID): string {
		return lists.auctions[itemID].owner;
	};


	getAuctions (): any[] {
		this.auctionsValue = 0;
		this.numberOfUndercuttedAuctions = 0;
		if(lists.myAuctions !== undefined && lists.myAuctions.length > 0) {
			this.activeAuctions = lists.myAuctions.length;
			lists.myAuctions.forEach(
				a => {
					this.auctionsValue += a.buyout;
					if(this.getAuctionOwner(a.item) !== user.character) {
						this.numberOfUndercuttedAuctions++;
					}
				});
		}
		return lists.myAuctions;
	}

	/**
	 * Used for sorting the list.
	 * @param  {string} sortBy A string for the field to sort by
	 */
	sortList(sortBy: string): void {
		if (this.buyOutAsc) {
			this.buyOutAsc = false;
			lists.myAuctions.sort(
				function (a, b) {
					if(sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] < b[sortBy] / a['quantity'] ? 1 :-1;
					}else {
						return a[sortBy] < b[sortBy] ? 1 :-1;
					}
				}
			);
		} else {
			this.buyOutAsc = true;
			lists.myAuctions.sort(
				function (a, b) {
					if(sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] > b[sortBy] / a['quantity'] ? 1 : -1;
					} else {
						return a[sortBy] > b[sortBy] ? 1 : -1;
					}
				}
			);
		}
	}
}
