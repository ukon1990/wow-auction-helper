import { IUser } from './interfaces';
import { itemClasses, watchlist } from './objects';
import Dexie from 'dexie';

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
export let user: IUser = {
	region: 'eu',
	realm: 'aegwynn',
	character: undefined,
	characters: [],
	apiTsm: undefined,
	apiWoWu: undefined,
	apiToUse: 'none',
	customPrices: [],
	buyoutLimit: 200,
	crafters: [],
	notifications: {
		isUpdateAvailable: true,
		isBelowVendorSell: true,
		isUndercutted: true,
		isWatchlist: true
	},
	watchlist: watchlist,
	isDarkMode: true
};

export const setRecipesForCharacter = (character) => {
	if (character.professions && user.realm.toLowerCase() === character.realm.replace(/[.*+?^${}()|[\]\\ ']/g, '-').toLowerCase()) {
		character.professions.primary.forEach(primary => {
			primary.recipes.forEach(recipe => {
				lists.myRecipes.push(recipe);
			});
		});
		character.professions.secondary.forEach(secondary => {
			secondary.recipes.forEach(recipe => {
				lists.myRecipes.push(recipe);
			});
		});
	}
};

lists.customPrices = { '124124': 3000000, '120945': 500000, '115524': 200000, '151568': 3000000 };

// Local database start
const TSM_TABLE_COLUMNS = `Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,
							RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,
							RegionAvgDailySold,RegionSaleRate`,
	WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm',
	ITEM_TABLE_COLUMNS = `id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells,
							itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation`,
	PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source',
	AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';
export const DB_TABLES = { TSM_TABLE_COLUMNS, WOWUCTION_TABLE_COLUMNS, ITEM_TABLE_COLUMNS, PET_TABLE_COLUMNS, AUCTIONS_TABLE_COLUMNS };

export const db = new Dexie('wah-db');
db.version(2).stores({
	auctions: AUCTIONS_TABLE_COLUMNS,
	wowuction: WOWUCTION_TABLE_COLUMNS,
	tsm: TSM_TABLE_COLUMNS,
	items: ITEM_TABLE_COLUMNS,
	pets: PET_TABLE_COLUMNS
}).upgrade(() => {
	console.log('Upgraded db');
});
db.version(1).stores({
	auctions: AUCTIONS_TABLE_COLUMNS,
	wowuction: WOWUCTION_TABLE_COLUMNS,
	tsm: TSM_TABLE_COLUMNS,
	items: `id,name,icon,itemClass,itemSubClass,quality,itemSpells,itemSource`,
	pets: PET_TABLE_COLUMNS
});
db.open()
	.then(() => {
		console.log('wah-db successfully started');
	}).catch(error => {
		console.log('Unable to start indexedDB', error);
	});
// Local database end

function getCorrectBuyValue(item: any, isSoldByVendor): number {
	let cost = 0;
	if (lists.customPrices[item.itemID] !== undefined) {
		cost = (lists.customPrices[item.itemID]);
	} else if (lists.auctions[item.itemID] !== undefined) {
		cost = lists.items[item.itemID].buyPrice;
		// (isSoldByVendor ? lists.items[item.itemID].buyPrice :
		// lists.auctions[item.itemID].buyout)
	} else if (user.apiToUse === 'tsm' && lists.tsm[item.itemID]) {
		cost = lists.tsm[item.itemID].MarketValue;
	}

	return cost;
}

export function getPet(speciesId, itemService) {
	if (lists.pets[speciesId] === undefined) {
		lists.pets[speciesId] = {
			'speciesId': speciesId,
			'petTypeId': 0,
			'creatureId': 54730,
			'name': 'Loading',
			'icon': 'spell_shadow_summonimp',
		};
		itemService.getPet(speciesId).subscribe(
			r => {
				lists.pets[speciesId] = r;
			}
		);
	}
	return lists.pets[speciesId];
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

/**
 * Checks if an item is @ AH or not.
 * @param  {string}  itemID
 * @return {boolean}        Availability
 */
export function isAtAH(itemID: string): boolean {
	return lists.auctions[itemID] !== undefined ? true : false;
}

/**
 * Gets thre auction item for an item
 * @param  {string} itemID
 * @return {object}
 */
export function getAuctionItem(itemID: string) {
	if (lists.auctions[itemID] === undefined) {
		return { 'quantity_total': 0 };
	}
	return lists.auctions[itemID];
}

/**
 * Finds the minimum price for an item
 * @param  {string} itemID
 * @return {number}
 */
export function getMinPrice(itemID: string): number {
	try {
		if (lists.customPrices[itemID]) {
			return lists.customPrices[itemID];
		}
		return lists.auctions[itemID].buyout;
	} catch (e) {
		if (user.apiToUse === 'wowuction' && lists.wowuction[itemID] !== undefined) {
			return lists.wowuction[itemID]['mktPrice'];
		} else if (user.apiToUse === 'tsm' && lists.tsm[itemID] !== undefined) {
			return lists.tsm[itemID].MarketValue;
		}
		return 0;
	}
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
