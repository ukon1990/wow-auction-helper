import { lists, db } from './globals';
import { ItemService } from '../services/item';
import Dexie from 'dexie';

export class Item {

	/**
	 * Used to get the icon url for a given item or pet.
	 * Example url: https://render-eu.worldofwarcraft.com/icons/56/inv_jewelcrafting_argusgemcut_orange_miscicons.jpg
	 * @param  {Auction or Item} auction It takes a auction or Item object.
	 * @return {string}         [description]
	 */
	public static getIcon(item: any): string {
		const itemID =
		item.item !== undefined ? item.item : item.itemID ? item.itemID : item.id,
			BASE_URL = 'https://render-eu.worldofwarcraft.com/icons/56/';
		let icon;
		try {
			if (item.petSpeciesId && lists.pets) {
				icon = lists.pets[item.petSpeciesId].icon;
			} else if (lists.items[itemID]) {
				icon = lists.items[itemID].icon;
			}
		} catch (err) {console.log(err, item, itemID); }

		if (icon === undefined) {
			return BASE_URL + 'inv_scroll_03.jpg';
		} else {
			return BASE_URL + icon + '.jpg';
		}
	}

	public static download(itemService: ItemService): Promise<any> {
		lists.isDownloading = true;
		// this.downloadingText = 'Downloading items';
		// Attempting to get from local storage
		if (
			localStorage.getItem('timestamp_items') === null ||
			localStorage.getItem('timestamp_items') === undefined ||
			localStorage.getItem('timestamp_items') !== new Date().toDateString()) {
			// The db was empty so we're downloading
			return itemService.getItems()
				.then(iDL => {
					lists.isDownloading = false;
					this.buildItemArray(iDL);
				});
		} else {
			return new Promise( resolve => {
				return db.table('items').toArray().then(i => {
					if (i.length > 0) {
						lists.isDownloading = false;
						lists.itemsArray = i;
						this.buildItemArray(i);
						return new Promise( r => {});
					} else {
						// The db was empty so we're downloading
						return itemService.getItems()
							.then(iDL => {
								lists.isDownloading = false;
								this.buildItemArray(iDL);
							});
					}
				});
			});
		}
	}

	public static buildItemArray(arr) {
		if (lists.items === undefined) {
			lists.items = [];
		}

		for (const i of arr) {
			lists.items[i['id']] = i;
		}
	}
}
