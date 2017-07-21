export interface IAuction {
	auctions;
}
export interface IItem {
}

export interface IPet {

}

// ID represents the spellID on an item
// API url: https://us.api.battle.net/wow/recipe/33994?locale=en_US&apikey=
export interface IRecipe {
	id: string;
	name: string;
	profession: string;
	icon: string;
	materials: IMaterial[];
}

export interface IMaterial {
	itemID: string;
	quantity: number;
}

export interface IUser {
	region: string;
	realm: string;
	character?: string;
	characters: any[];
	apiTsm?: string;
	apiWoWu?: string;
	customPrices?: any;
	apiToUse: string;
	buyoutLimit: number;
	crafters: any[];
	notifications: any;
	watchlist?: {recipes: object, items: object, groups: any[]};
	isDarkMode?: boolean;
}
