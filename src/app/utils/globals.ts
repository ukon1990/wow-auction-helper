import { IUser } from './interfaces';
import Dexie from 'dexie';

export let lists = {
	isDownloading: true,
	myAuctions: [],
	auctions: [],
	wowuction: [],
	tsm: [],
	items: {},
	pets: [],
	recipes: [],
	recipesIndex: [],
	customPrices: {}
};
export let user: IUser = {
	'region': 'eu',
	'realm': 'aegwynn',
	'character': undefined,
	'apiTsm': undefined,
	'apiWoWu': undefined,
	'apiToUse': 'none',
	'customPrices': [],
	'buyoutLimit': 200
}


lists.customPrices = {'124124': 3000000, '120945': 500000, '115524': 200000};

// Local database start
const TSM_TABLE_COLUMNS = `Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,
							RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,
							RegionAvgDailySold,RegionSaleRate`,
	WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm',
	ITEM_TABLE_COLUMNS = `id,name,icon,itemClass,itemSubClass,quality,itemSpells,
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


export let itemClasses = {"classes":[{"class":17,"name":"Battle Pets","subclasses":[{"subclass":0,"name":"BattlePet"}]},{"class":0,"name":"Consumable","subclasses":[{"subclass":0,"name":"Explosives and Devices"},{"subclass":5,"name":"Food & Drink"},{"subclass":1,"name":"Potion"},{"subclass":2,"name":"Elixir"},{"subclass":3,"name":"Flask"},{"subclass":7,"name":"Bandage"},{"subclass":8,"name":"Other"},{"subclass":9,"name":"Vantus Rune"}]},{"class":1,"name":"Container","subclasses":[{"subclass":0,"name":"Bag"},{"subclass":1,"name":"Soul Bag"},{"subclass":2,"name":"Herb Bag"},{"subclass":3,"name":"Enchanting Bag"},{"subclass":4,"name":"Engineering Bag"},{"subclass":5,"name":"Gem Bag"},{"subclass":6,"name":"Mining Bag"},{"subclass":7,"name":"Leatherworking Bag"},{"subclass":8,"name":"Inscription Bag"},{"subclass":9,"name":"Tackle Box"},{"subclass":10,"name":"Cooking Bag"}]},{"class":2,"name":"Weapon","subclasses":[{"subclass":1378,"name":"Two-Handed Melee Weapon"},{"subclass":41617,"name":"One-Handed Melee Weapon"},{"subclass":41105,"name":"One-Handed Melee Weapon"},{"subclass":174067,"name":"Melee Weapon"},{"subclass":173555,"name":"Melee Weapon"},{"subclass":0,"name":"Axe"},{"subclass":1,"name":"Axe"},{"subclass":2,"name":"Bow"},{"subclass":3,"name":"Gun"},{"subclass":4,"name":"Mace"},{"subclass":5,"name":"Mace"},{"subclass":6,"name":"Polearm"},{"subclass":7,"name":"Sword"},{"subclass":8,"name":"Sword"},{"subclass":262156,"name":"Ranged Weapon"},{"subclass":9,"name":"Warglaives"},{"subclass":10,"name":"Staff"},{"subclass":11,"name":"Bear Claws"},{"subclass":12,"name":"Cat Claws"},{"subclass":13,"name":"Fist Weapon"},{"subclass":14,"name":"Miscellaneous"},{"subclass":15,"name":"Dagger"},{"subclass":16,"name":"Thrown"},{"subclass":17,"name":"Spear"},{"subclass":18,"name":"Crossbow"},{"subclass":19,"name":"Wand"},{"subclass":20,"name":"Fishing Pole"}]},{"class":3,"name":"Gem","subclasses":[{"subclass":0,"name":"Intellect"},{"subclass":1,"name":"Agility"},{"subclass":2,"name":"Strength"},{"subclass":3,"name":"Stamina"},{"subclass":4,"name":"Spirit"},{"subclass":5,"name":"Critical Strike"},{"subclass":6,"name":"Mastery"},{"subclass":7,"name":"Haste"},{"subclass":8,"name":"Versatility"},{"subclass":9,"name":"Other"},{"subclass":10,"name":"Multiple Stats"},{"subclass":11,"name":"Artifact Relic"}]},{"class":4,"name":"Armor","subclasses":[{"subclass":2,"name":"Leather"},{"subclass":3,"name":"Mail"},{"subclass":4,"name":"Plate"},{"subclass":5,"name":"Cosmetic"},{"subclass":6,"name":"Shield"},{"subclass":7,"name":"Libram"},{"subclass":8,"name":"Idol"},{"subclass":9,"name":"Totem"},{"subclass":10,"name":"Sigil"},{"subclass":11,"name":"Relic"},{"subclass":96,"name":"Shield"},{"subclass":0,"name":"Miscellaneous"},{"subclass":1,"name":"Cloth"}]},{"class":5,"name":"Reagent","subclasses":[{"subclass":0,"name":"Reagent"},{"subclass":1,"name":"Keystone"}]},{"class":6,"name":"Projectile","subclasses":[{"subclass":2,"name":"Arrow"},{"subclass":3,"name":"Bullet"}]},{"class":7,"name":"Tradeskill","subclasses":[{"subclass":10,"name":"Elemental"},{"subclass":15,"name":"Weapon Enchantment - Obsolete"},{"subclass":16,"name":"Inscription"},{"subclass":5,"name":"Cloth"},{"subclass":6,"name":"Leather"},{"subclass":7,"name":"Metal & Stone"},{"subclass":8,"name":"Cooking"},{"subclass":9,"name":"Herb"},{"subclass":12,"name":"Enchanting"},{"subclass":4,"name":"Jewelcrafting"},{"subclass":1,"name":"Parts"},{"subclass":11,"name":"Other"}]},{"class":9,"name":"Recipe","subclasses":[{"subclass":0,"name":"Book"},{"subclass":1,"name":"Leatherworking"},{"subclass":2,"name":"Tailoring"},{"subclass":3,"name":"Engineering"},{"subclass":4,"name":"Blacksmithing"},{"subclass":5,"name":"Cooking"},{"subclass":6,"name":"Alchemy"},{"subclass":7,"name":"First Aid"},{"subclass":8,"name":"Enchanting"},{"subclass":9,"name":"Fishing"},{"subclass":10,"name":"Jewelcrafting"},{"subclass":11,"name":"Inscription"}]},{"class":11,"name":"Quiver","subclasses":[{"subclass":2,"name":"Quiver"},{"subclass":3,"name":"Ammo Pouch"}]},{"class":12,"name":"Quest","subclasses":[{"subclass":0,"name":"Quest"}]},{"class":13,"name":"Key","subclasses":[{"subclass":0,"name":"Key"},{"subclass":1,"name":"Lockpick"}]},{"class":15,"name":"Miscellaneous","subclasses":[{"subclass":0,"name":"Junk"},{"subclass":1,"name":"Reagent"},{"subclass":2,"name":"Companion Pets"},{"subclass":3,"name":"Holiday"},{"subclass":4,"name":"Other"},{"subclass":5,"name":"Mount"}]},{"class":16,"name":"Glyph","subclasses":[{"subclass":1,"name":"Warrior"},{"subclass":2,"name":"Paladin"},{"subclass":3,"name":"Hunter"},{"subclass":4,"name":"Rogue"},{"subclass":5,"name":"Priest"},{"subclass":6,"name":"Death Knight"},{"subclass":7,"name":"Shaman"},{"subclass":8,"name":"Mage"},{"subclass":9,"name":"Warlock"},{"subclass":10,"name":"Monk"},{"subclass":11,"name":"Druid"},{"subclass":12,"name":"Demon Hunter"}]},{"class":18,"name":"WoW Token","subclasses":[{"subclass":0,"name":"WoW Token"}]}]};

let examplePetAuction =
	{
		"modifiers": [
			{ "type": 3, "value": 333 },
			{ "type": 4, "value": 50331659 },
			{ "type": 5, "value": 1 }
		],
		"petSpeciesId": 333,
		"petBreedId": 11,
		"petLevel": 1,
		"petQualityId": 3
	};

let petExample = {
	"speciesId": 258,
	"petTypeId": 9,
	"creatureId": 42078,
	"name": "Mini Thor",
	"icon": "t_roboticon",
	"description": "Powerful artillery of the Terran army. The Thor is always the first one in and the last one out!",
	"source": "Promotion: StarCraft II: Wings of Liberty Collector's Edition",
};

export function calcCost(c) {
		if (c !== null) {
			let matBuyout: number;
			c['cost'] = 0;
			c['buyout'] = 0;
			c['profit'] = 0;
			c['estDemand'] = 0;

			if(user.apiToUse === 'tsm') {
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
							if(lists.items[m.itemID] === undefined) {
								// console.log('Lacking item=' + m.name + ' id=' + m.itemID);
								//this.getItem(m.itemID);
							}

							if(m.altered === undefined && !m.altered) {
								m.count = (m.count / c.minCount).toFixed(2);
								m.altered = true;
							}

							matBuyout = lists.auctions[m.itemID] !== undefined ?
								(lists.auctions[m.itemID].buyout) :
								lists.customPrices[m.itemID] !== undefined ?
									lists.customPrices[m.itemID] : 0;

							if(lists.items[m.itemID] !== undefined &&
								lists.items[m.itemID].itemSource.sourceType === 'CREATED_BY_SPELL') {
								if(m.useCraftedBy === undefined) {
									m.createdBy = lists.items[m.itemID].itemSource.sourceId;
									m.useCraftedBy = false;
								}
							}
							if(m.useCraftedBy !== undefined && m.useCraftedBy) {
								c.cost += lists.recipes[lists.recipesIndex[m.createdBy]].cost !== 0 ?
									m.count * lists.recipes[lists.recipesIndex[m.createdBy]].cost : 0;
							} else {
								c.cost += matBuyout !== 0 ? m.count * matBuyout : 0;
							}
						} catch (errr) {
							console.log('Failed at calculating cost', errr);
							console.log(c);
						}
					}
				} catch (err) {
					console.log(err);
					console.log(c);
				}
				if((user.apiToUse === 'tsm' || user.apiToUse === 'wowuction') &&
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

export function copperToString(c): string {
	//Just return a string
	var result = [];
	c = Math.round(c);
	result[0] = c % 100;
	c = (c - result[0]) / 100;
	result[1] = c % 100; //Silver
	result[2] = ((c - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); //Gold
	return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
}

export function	copperToArray(c): string {
	//Just return a string
	var result = [];
	c = Math.round(c);
	result[0] = c % 100;
	c = (c - result[0]) / 100;
	result[1] = c % 100; //Silver
	result[2] = ((c - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); //Gold
	return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
}

export function getPet(speciesId) {
	if (lists.pets[speciesId] === undefined) {
		lists.pets[speciesId] = {
			"speciesId": speciesId,
			"petTypeId": 0,
			"creatureId": 54730,
			"name": "Loading",
			"icon": "spell_shadow_summonimp",
		};
		this.petObserver = this.itemService.getPet(speciesId).subscribe(
			r => {
				lists.pets[speciesId] = r;
			}
		);
	}
	return lists.pets[speciesId].name;
}
export const itemContext = ['Drop', 'World drop', 'Raid (old)', 'Normal dungeon', 'Raid finder', 'Heroic', 'Mythic', 'Player drop', 'Unknown', 'Gathering', 'Unknown', 'Drop', 'Unknown', 'Profession', 'Vendor', 'Vendor', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Timewalking', 'Trash drop', 'Unknown', 'World drop', 'World drop', 'Unknown', 'Unknown', 'Unknown', 'Mythic dungeon', 'Garrison mission'];
