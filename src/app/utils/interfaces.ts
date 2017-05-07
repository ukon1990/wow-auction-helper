export class IAuction {
	auctions;
}
export class IItem {
}

export class IPet {

}

// ID represents the spellID on an item
// API url: https://us.api.battle.net/wow/recipe/33994?locale=en_US&apikey=
export class IRecipe {
	id: string;
	name: string;
	profession: string;
	icon: string;
	materials: IMaterial[];
}

export class IMaterial {
	itemID: string;
	quantity: number;
}

export class IUser {
	region: string;
	realm: string;
	character?: string;
	apiTsm?: string;
	apiWoWu?: string;
	customPrices?: any;
	apiToUse: string;
	buyoutLimit: number;
	crafters: any[];
	watchlist?: {recipes: object, items: object, groups: any[]};
}
