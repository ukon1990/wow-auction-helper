import { lists, user } from './globals';
import { Notification } from './notification';
import { Router } from '@angular/router';
import { ItemService } from '../services/item.service';

export default class Crafting {

	public static download(itemService: ItemService): Promise<any> {
		return itemService.getRecipes()
			.then(recipe => {
				if (lists.recipes === undefined) {
					lists.recipes = [];
				}
				recipe.recipes.forEach(r => {
					if (r && r['profession']) {
						r['estDemand'] = 0;
						lists.recipesIndex[r.spellID] = lists.recipes.push(r) - 1;
						if (!lists.itemRecipes[r.itemID]) {
							lists.itemRecipes[r.itemID] = [];
						}
						lists.itemRecipes[r.itemID].push(r.spellID);
					}
				});
			}).catch(error => {
				console.error('Failed at downloading recipes', error);
			});
	}

	public static getCraftingCosts(router: Router): void {
		let potentialProfit = 0;
		console.log('starting crafting cost calc');
		for (let c of lists.recipes) {
			this.calcCost(c);
			if (c.profit > 0) {
				potentialProfit += c.profit;
			}
		}
		console.log('Done calculating crafting costs');

		if (user.notifications.isWatchlist) {
			// checking if watchlist gives any alerts
			let watchlistAlerts = 0;
			const tmpList = [];
			lists.myRecipes.forEach(recipeID => {
				tmpList[recipeID] = 'owned';
			});
			Object.keys(user.watchlist.items).forEach(group => {
				user.watchlist.items[group].forEach(item => {
					if ((item.alert === undefined || item.alert) &&
						(item.criteria === 'below' && lists.auctions[item.id].buyout <= item.value ||
							item.criteria === 'above' && lists.auctions[item.id].buyout >= item.value)) {
						watchlistAlerts++;
						Notification.send(item.name, `Current lowest buyout at ${
							Math.round(100 - (item.value / lists.auctions[item.id].buyout) * 100)
							}% of the alert value!`, router, 'watchlist', lists.items[item.id].icon);
					} else if (lists.itemRecipes[item.id]) {
						lists.itemRecipes[item.id].forEach(r => {
							if (tmpList[r] &&
								lists.recipes[lists.recipesIndex[r]].profit /
								lists.recipes[lists.recipesIndex[r]].buyout > item.minCraftProfit / 100) {
								watchlistAlerts++;
							}
						});
					}
				});
			});
			if (watchlistAlerts > 0) {
				Notification.send(
					`Watchlist items!`,
					`There are ${watchlistAlerts} items meet your criteria.`, router, 'watchlist');
			}
		}
	}

	public static calcCost(c, isSoldByVendor?: boolean) {
		if (c !== null) {
			let matBuyout: number;
			c['cost'] = 0;
			c['buyout'] = 0;
			c['profit'] = 0;
			c['profitPercent'] = 0;
			c['estDemand'] = 0;

			if (user.apiToUse === 'tsm') {
				c['mktPrice'] = lists.tsm[c.itemID] !== undefined ?
					lists.tsm[c.itemID]['MarketValue'] : 0;
				c['estDemand'] = lists.tsm[c.itemID] !== undefined ?
					Math.round(lists.tsm[c.itemID]['RegionSaleRate'] * 100) : 0;
			} else if (user.apiToUse === 'wowuction') {
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
					for (const m of c.reagents) {
						try {
							if (lists.items[m.itemID] === undefined) {
								// TODO: Logic in case item is missing
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
							console.error('Failed at calculating cost', errr);
						}
					}
				} catch (err) {
					console.error('calcCost failed: ', err);
				}
				if ((user.apiToUse === 'tsm' || user.apiToUse === 'wowuction') &&
					c.mktPrice !== 0 &&
					Math.round((c.buyout / c.mktPrice) * 100) >= user.buyoutLimit) {
					c.profit = c.mktPrice - c.cost;
					c.profitPercent = c.profit / c.mktPrice;
				} else {
					c.profit = c.buyout - c.cost;
					c.profitPercent = c.profit / c.buyout;
				}

			} catch (e) {
				console.error(`Unable to download ${c}`, e);
			}
		}
	}
}
