import {Recipe} from '../../crafting/models/recipe';
import {Reagent} from '../../crafting/models/reagent';
import {SharedService} from '../../../services/shared.service';
import {Item, ItemInventory, ItemPurchase} from '../../../models/item/item';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Auction} from '../../auction/models/auction.model';
import {Report} from '../../../utils/report.util';
import {ErrorReport} from '../../../utils/error-report.util';
import {ProfitSummary} from '../../addon/models/profit-summary.model';
import {ShoppingCartItem} from './shopping-cart-item.model';


export class ShoppingCart {
  // Recipe ID's
  recipes: ShoppingCartItem[] = [];
  recipeMap = {};
  shoppingString: string;
  reagents: ShoppingCartItem[] = [];
  reagentMap = {};

  sources = {
    inventory: [],
    ah: [],
    vendor: [],
    farm: []
  };
  totalValue = 0;
  sumCost = 0;
  sumTotalCost = 0;
  profit = 0;
  sumEstimatedInventoryCost = 0;
  tsmShoppingString = '';

  constructor() {
    const ls = localStorage['shopping_cart'],
      lsObject = ls ? JSON.parse(localStorage['shopping_cart']) : undefined;
    if (lsObject && lsObject.reagents && lsObject.reagents[0]) {
      this.upgrade(lsObject);
    } else if (lsObject) {
      this.import(lsObject);
    }
  }

  upgrade(old: object): void {
    try {
      if (old && old['reagents'] && old['recipes']) {
        old['recipes'].forEach(recipe => {
          const r = SharedService.recipesMap[recipe.id];
          if (r) {
            this.add(r, recipe.quantity, true);
          }
        });

        this.save();
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.upgrade', error);
    }
  }

  import(data: object): void {
    try {
      if (SharedService.recipes.length === 0) {
        return;
      }
      // Import recipes
      if (data['recipes']) {
        data['recipes']
          .forEach(recipe => {
            const r = SharedService.recipesMap[recipe.id];
            if (!r) {
              return;
            }
            this.add(
              r,
              recipe.quantity,
              true);
          });
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.import', error);
    }
  }

  setSources(): void {
    try {
      const realm = this.getUserRealm(),
        inventoryMap = SharedService.tsmAddonData.inventoryMap;
      let inventory;
      if (realm && inventoryMap && inventoryMap[realm.name]) {
        const faction = SharedService.user.faction;
        inventory = inventoryMap[realm.name][faction];
      }

      this.sources.ah = [];
      this.sources.inventory = [];
      this.sources.vendor = [];
      this.sources.farm = [];
      this.reagents
        .forEach((reagent: ShoppingCartItem) =>
          this.setSourcesForReagent(reagent, inventory));
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.setSources', error);
    }
  }

  private getUserRealm() {
    return SharedService.realms[SharedService.user.realm];
  }

  add(recipe: Recipe, quantity: number = 1, doNotSave?: boolean): void {
    try {
      if (this.recipeMap[recipe.id]) {
        (this.recipeMap[recipe.id] as ShoppingCartItem)
          .increment(quantity);
      } else {
        this.recipeMap[recipe.id] = new ShoppingCartItem(
          recipe.id, quantity, undefined, recipe.itemID);
        this.recipes.push(this.recipeMap[recipe.id]);
      }
      this.addReagents(recipe, quantity);
      this.calculateCosts();

      if (!doNotSave) {
        this.save();
      }
      SharedService.events.shoppingCart.emit();
      Report.send('Added recipe to shopping cart', 'Shopping cart');
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.add', error);
    }
  }

  addReagents(recipe: Recipe, quantity: number = 1): void {
    try {
      recipe.reagents
        .forEach((reagent: Reagent) => {
          if (reagent.intermediateEligible && reagent.recipe.roi > 0) {
            this.add(reagent.recipe, quantity);
          } else {
            this.addReagent(reagent, quantity);
          }
        });
      this.setSources();
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.addReagents', error);
    }
  }

  private addReagent(reagent: Reagent, quantity: number) {
    try {
      if (this.reagentMap[reagent.id]) {
        (this.reagentMap[reagent.id] as ShoppingCartItem)
          .increment(
            reagent.quantity * quantity);
      } else {
        const item = new ShoppingCartItem(
          reagent.id, reagent.quantity * quantity);
        this.reagentMap[reagent.id] = item;
        this.reagents.push(item);
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.addReagent', error);
    }
  }

  remove(id: number, quantity?: number): void {
    try {
      const recipe = SharedService.recipesMap[id],
        cartRecipe: ShoppingCartItem = this.recipeMap[id];
      if (!recipe || !cartRecipe) {
        return;
      }

      if (!quantity) {
        quantity = cartRecipe.quantity;
      }

      cartRecipe.decrement(quantity);

      if (cartRecipe.quantity <= 0) {
        this.removeFromList(cartRecipe, this.recipes, this.recipeMap);
      }

      recipe.reagents
        .forEach((reagent: Reagent) => {
          this.removeReagentForRecipe(reagent, quantity);
        });

      this.setSources();
      this.calculateCosts();
      this.save();
      SharedService.events.shoppingCart.emit();
      Report.send('Removed recipe from shopping cart', 'Shopping cart');
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.remove', error);
    }
  }

  private removeReagentForRecipe(reagent: Reagent, quantity: number) {
    try {
      if (this.reagentMap[reagent.id]) {
        const cartReagent = (this.reagentMap[reagent.id] as ShoppingCartItem);

        cartReagent.decrement(
          reagent.quantity * quantity);

        if (cartReagent.quantity <= 0) {
          this.removeFromList(cartReagent, this.reagents, this.reagentMap);
        }
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.removeReagentForRecipe', error);
    }
  }

  private removeFromList(cartItem: ShoppingCartItem, array: ShoppingCartItem[], map: object) {
    try {
      const index = array
        .findIndex((item) =>
          item === cartItem);
      array.splice(index, 1);
      delete map[cartItem.id];
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.removeFromList', error);
    }
  }

  private setSourcesForReagent(reagent: ShoppingCartItem, inventory: object) {
    try {
      let addedCount = this.handleInventorySource(inventory, reagent);

      if (addedCount < reagent.quantity) {
        addedCount += this.handleVendorSource(reagent, addedCount);
      }

      if (addedCount < reagent.quantity) {
        addedCount += this.handleAuctionSource(reagent, addedCount);
      }

      if (addedCount < reagent.quantity) {
        this.handleFarmSource(reagent, addedCount);
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.setSourcesForReagent', error);
    }
  }

  private handleInventorySource(inventory: object, reagent: ShoppingCartItem): number {
    let addedCount = 0;
    try {
      if (inventory && inventory[reagent.id]) {
        const i = inventory[reagent.id];
        if (i.quantity >= reagent.quantity) {
          addedCount += reagent.quantity;
          this.sources.inventory.push(reagent);
          reagent.setCharacters(inventory[reagent.id].characters);
        } else {
          const item = new ShoppingCartItem(reagent.id, i.quantity);
          item.setCharacters((inventory[reagent.id] as ItemInventory).characters);
          this.sources.inventory.push(item);
          addedCount += i.quantity;
        }

        reagent.inventoryQuantity = inventory[reagent.id].quantity;
        this.setInventoryHistory(reagent, addedCount);
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.handleInventorySource', error);
    }
    return addedCount;
  }

  private setInventoryHistory(reagent: ShoppingCartItem, quantity: number) {
    try {
      if (!SharedService.tsmAddonData || !SharedService.tsmAddonData.profitSummary) {
        return;
      }

      const profitSummary: ProfitSummary = SharedService.tsmAddonData.profitSummary[this.getUserRealm().name],
        item = profitSummary.total.purchases.itemMap[reagent.id];
      let quantityFound = 0;

      if (!item) {
        return;
      }
      const history: ItemPurchase[] = [], used = [];
      reagent.inventoryValue = 0;

      item.history
        .forEach((purchase: ItemPurchase) => {
          history.push(purchase);
        });

      history
        .sort((a: ItemPurchase, b: ItemPurchase) =>
          b.timestamp - a.timestamp);

      history.forEach((purchase: ItemPurchase) => {
        if (quantity <= quantityFound) {
          return;
        }

        if (purchase.quantity + quantityFound > quantity) {
          reagent.inventoryValue += purchase.buyout * (quantity - quantityFound);
        } else {
          reagent.inventoryValue += purchase.buyout * purchase.quantity;
        }
        used.push(purchase);

        quantityFound += purchase.quantity;
      });
      reagent.avgCost = reagent.inventoryValue / reagent.quantity;
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.setInventoryHistory', error);
    }
  }

  calculateCosts(): void {
    try {
      this.totalValue = 0;
      this.sumCost = 0;
      this.sumTotalCost = 0;
      this.profit = 0;
      this.sumEstimatedInventoryCost = 0;

      this.recipes.forEach((item: ShoppingCartItem) => {
        const auctionItem: AuctionItem = SharedService.auctionItemsMap[item.itemID];
        if (auctionItem) {
          this.totalValue += auctionItem.buyout * item.quantity;
        }
      });

      this.sources.inventory
        .forEach((reagent: ShoppingCartItem) => {
          this.sumEstimatedInventoryCost += reagent.inventoryValue;
        });

      this.sources.vendor
        .forEach((reagent: ShoppingCartItem) => {
          reagent.cost = (SharedService.items[reagent.id] as Item)
            .itemSource.soldBy[0]
            .cost * reagent.quantity;
          this.sumCost += reagent.cost;
        });
      this.sources.ah
        .forEach((reagent: ShoppingCartItem) => {
          const result = this.getSumCostOfItem(reagent.id, reagent.quantity);
          reagent.cost = result.need.cost;
          reagent.avgCost = reagent.cost / reagent.quantity;

          reagent.totalCost = result.total.cost;
          reagent.totalCount = result.total.count;
          this.sumCost += reagent.cost;
          this.sumTotalCost += reagent.totalCost;
        });

      this.profit = this.totalValue - this.sumCost;
      this.setShoppingString();
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.calculateCosts', error);
    }
  }

  /*
   Calculates the cost of buying an item, assuming that we buy whatever
   stacks that are available until we have the correct quantity
   */
  private getSumCostOfItem(id: number, quantity: number): {
    need: { cost: number; count: number },
    total: { cost: number; count: number }
  } {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[id],
      result = {
        need: {
          cost: 0,
          count: 0
        },
        total: {
          cost: 0,
          count: 0
        }
      };
    try {
      if (auctionItem) {
        auctionItem.auctions.forEach((item: Auction) => {
          const newQuantity = item.quantity + result.need.count,
            maxQuantityDiffPercent = 1.2;

          if (result.need.count >= quantity) {
            return;
          } else if (newQuantity / quantity <= maxQuantityDiffPercent) {
            // Should not get more than 20% more than we need.

            if (newQuantity > quantity) {
              const perItem = item.buyout / item.quantity;
              const need = (quantity - (item.quantity + result.need.count)) * -1;
              result.need.cost += need * perItem;
              result.need.count += need;
            } else {
              result.need.cost += item.buyout;
              result.need.count += item.quantity;
            }

            result.total.cost += item.buyout;
            result.total.count += item.quantity;
          }
        });
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.getSumCostOfItem', error);
    }
    return result;
  }

  private handleVendorSource(reagent: ShoppingCartItem, currentQuantity: number): number {
    try {
      const item: Item = SharedService.items[reagent.id],
        auctionItem: AuctionItem = SharedService.auctionItemsMap[reagent.id],
        need = reagent.quantity - currentQuantity;

      if (this.isAvailableAtVendor(item) && this.isVendorCheaperThanAH(item, auctionItem)) {
        this.sources.vendor.push(new ShoppingCartItem(reagent.id, need));
        return need;
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.handleVendorSource', error);
    }
    return 0;
  }

  private isVendorCheaperThanAH(item: Item, auctionItem: AuctionItem) {
    const source = item.itemSource;
    return !auctionItem || source && source.soldBy[0] && source.soldBy[0].cost < auctionItem.buyout;
  }

  private isAvailableAtVendor(item: Item): boolean {
    return item && item.itemSource &&
      item.itemSource.soldBy && item.itemSource.soldBy.length > 0;
  }

  private handleAuctionSource(reagent: ShoppingCartItem, addedCount: number) {
    try {
      const need = reagent.quantity - addedCount,
        auctionItem: AuctionItem = SharedService.auctionItemsMap[reagent.id];

      if (need > 0 && auctionItem && auctionItem.quantityTotal > need) {
        const cartItem = new ShoppingCartItem(reagent.id, need);
        this.sources.ah.push(cartItem);
        return cartItem.quantity;
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.handleAuctionSource', error);
    }

    return 0;
  }

  private handleFarmSource(reagent: ShoppingCartItem, addedCount: number) {
    this.sources.farm.push(
      new ShoppingCartItem(reagent.id, reagent.quantity - addedCount));
  }

  clear() {
    this.recipes.forEach(recipe =>
      this.remove(recipe.id, recipe.quantity));
    this.tsmShoppingString = '';

    this.calculateCosts();
    this.save();
    Report.send('Cleared cart', 'Shopping cart');
  }

  private save() {
    localStorage['shopping_cart'] = JSON.stringify({
      recipes: this.recipes
    });
  }

  private setShoppingString(): void {
    try {
      this.tsmShoppingString = '';
      let item: AuctionItem;
      this.sources.ah.forEach((r: ShoppingCartItem) => {
        item = SharedService.auctionItemsMap[r.id];
        if (item) {
          this.tsmShoppingString += `${item.name}/exact/x${Math.ceil(r.quantity)};`;
        }
      });

      if (this.tsmShoppingString.length > 0 && this.tsmShoppingString.endsWith(';')) {
        this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
      }
    } catch (error) {
      ErrorReport.sendError('ShoppingCart.setShoppingString', error);
    }
  }
}


