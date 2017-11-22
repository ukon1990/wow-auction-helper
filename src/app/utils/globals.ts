import { IUser } from './interfaces';
import { itemClasses, watchlist } from './objects';
import { User } from 'app/models/user';
import { CharacterService } from 'app/services/character.service';

export let lists = {
	isDownloading: true,
	myAuctions: [],
	auctions: [],
	wowuction: [],
	tsm: [],
	items: {},
	itemsArray: [],
	itemRecipes: {},
	pets: [],
	recipes: [],
	recipesIndex: [],
	customPrices: {},
	myRecipes: []
};

lists.customPrices = { '124124': 3000000, '120945': 500000, '115524': 200000, '151568': 3000000 };


// Local database end

function getCorrectBuyValue(item: any, isSoldByVendor): number {
	let cost = 0;
	if (lists.customPrices[item.itemID] !== undefined) {
		cost = (lists.customPrices[item.itemID]);
	} else if (lists.auctions[item.itemID] !== undefined) {
		cost = lists.items[item.itemID].buyPrice;
		// (isSoldByVendor ? lists.items[item.itemID].buyPrice :
		// lists.auctions[item.itemID].buyout)
	} else if (CharacterService.user.apiToUse === 'tsm' && lists.tsm[item.itemID]) {
		cost = lists.tsm[item.itemID].MarketValue;
	}

	return cost;
}

/**
 * Used to get the icon url for a given item or pet.
 * @param  {Auction or Item} auction It takes a auction or Item object.
 * @return {string}         [description]
 */
export function getIcon(auction): string {
	const itemID = auction.item !== undefined ? auction.item : auction.itemID;
	let url = 'http://blzmedia-a.akamaihd.net/wow/icons/56/', icon;
	try {
		if (auction.petSpeciesId !== undefined && lists.pets !== undefined) {
			if (lists.pets[auction.petSpeciesId] === undefined) {
				// getPet(auction.petSpeciesId);
			}
			icon = lists.pets[auction.petSpeciesId].icon;
		} else if (lists.items[itemID] !== undefined) {
			icon = lists.items[itemID].icon;
		}
	} catch (err) { console.log(err, auction, itemID); }

	if (icon === undefined) {
		url += 'inv_scroll_03.jpg';
	} else {
		url += icon + '.jpg';
	}
	return url;
}


export const API_KEY = '9crkk73wt4ck6nmsuzycww4ruq2z4t95';
export const itemContext = [
	'Drop', 'World drop', 'Raid (old)', 'Normal dungeon',
	'Raid finder', 'Heroic', 'Mythic', 'Player drop', 'Unknown',
	'Gathering', 'Unknown', 'Drop', 'Unknown', 'Profession', 'Vendor',
	'Vendor', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown',
	'Unknown', 'Timewalking', 'Trash drop', 'Unknown', 'World drop',
	'World drop', 'Unknown', 'Unknown', 'Unknown', 'Mythic dungeon',
	'Garrison mission'];
