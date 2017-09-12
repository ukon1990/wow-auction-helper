import { lists } from './globals';

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
}
