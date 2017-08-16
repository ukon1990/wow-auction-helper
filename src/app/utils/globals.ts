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
			primary.recipes.forEach( recipe => {
				lists.myRecipes.push(recipe);
			});
		});
		character.professions.secondary.forEach(secondary => {
			secondary.recipes.forEach( recipe => {
				lists.myRecipes.push(recipe);
			});
		});
	}
};

lists.customPrices = {'124124': 3000000, '120945': 500000, '115524': 200000};

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


export function calcCost(c) {
		if (c !== null) {
			let matBuyout: number;
			c['cost'] = 0;
			c['buyout'] = 0;
			c['profit'] = 0;
			c['estDemand'] = 0;

			if (user.apiToUse === 'tsm') {
				c['mktPrice'] = lists.tsm[c.itemID] !== undefined ?
					lists.tsm[c.itemID]['MarketValue'] : 0;
				c['estDemand'] = lists.tsm[c.itemID] !== undefined ?
					Math.round(lists.tsm[c.itemID]['RegionSaleRate'] * 100) : 0;
			} else if(user.apiToUse === 'wowuction') {
				c['mktPrice'] = lists.tsm[c.itemID] !== undefined ?
					lists.wowuction[c.itemID]['mktPrice'] : 0;
				c['estDemand'] = lists.wowuction[c.itemID] !== undefined ?
					Math.round(lists.wowuction[c.itemID]['estDemand'] * 100) : 0;
			}
			try {
				c.buyout = lists.auctions[c.itemID] !== undefined ?
					(lists.auctions[c.itemID].buyout) : 0;
				try {
					c.minCount = parseInt(c.minCount, 10);
					if (c.minCount < 1) {
						c.minCount = 1;
					}
					for (let m of c.reagents) {
						try {
							if (lists.items[m.itemID] === undefined) {
								// console.log('Lacking item=' + m.name + ' id=' + m.itemID);
								//this.getItem(m.itemID);
							}

							if (m.altered === undefined && !m.altered) {
								m.count = (m.count / c.minCount).toFixed(2);
								m.altered = true;
							}

							matBuyout = lists.customPrices[m.itemID] !== undefined ?
								(lists.customPrices[m.itemID]) :
								lists.auctions[m.itemID] !== undefined ?
									lists.auctions[m.itemID].buyout : user.apiToUse === 'tsm' ?
										lists.tsm[m.itemID] ?
											lists.tsm[m.itemID].MarketValue : 0 :
											0;
							/*
							if (lists.items[m.itemID] !== undefined &&
								lists.items[m.itemID].itemSource.sourceType === 'CREATED_BY_SPELL') {
								if (m.useCraftedBy === undefined) {
									m.createdBy = lists.items[m.itemID].itemSource.sourceId;
									m.useCraftedBy = false;
								}
							}*/
							if (m.useCraftedBy !== undefined && m.useCraftedBy) {
								c.cost += lists.recipes[lists.recipesIndex[m.createdBy]] &&
											lists.recipes[lists.recipesIndex[m.createdBy]].cost !== 0 ?
												m.count * lists.recipes[lists.recipesIndex[m.createdBy]].cost : 0;
							} else {
								c.cost += matBuyout !== 0 ? m.count * matBuyout : 0;
							}
						} catch (errr) {
							console.log('Failed at calculating cost', errr);
							//console.log(c);
						}
					}
				} catch (err) {
					console.log('calcCost failed: ', err);
					//console.log(c);
				}
				if ((user.apiToUse === 'tsm' || user.apiToUse === 'wowuction') &&
					c.mktPrice !== 0 &&
					Math.round((c.buyout / c.mktPrice) * 100) >= user.buyoutLimit) {
					c.profit = c.mktPrice - c.cost;
				} else {
					c.profit = c.buyout - c.cost;
				}

			} catch (e) {
				console.log(e);
				console.log(c);
			}
		}
	}

/**
 * Used for returning a string of the value formatted.
 * @param  {number} c This is the value in copper
 * @return {string}   Formatted string [xg xs xc]
 */
export function copperToString(c: number): string {
	let result = [];
	c = Math.round(c);
	result[0] = c % 100;
	c = (c - result[0]) / 100;
	// Silver
	result[1] = c % 100;
	// Gold
	result[2] = ((c - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
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
	} catch (err) {console.log(err, auction, itemID); }

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
