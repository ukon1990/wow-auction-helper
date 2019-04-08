import {Recipe} from '../crafting/recipe';
import {Reagent} from '../crafting/reagent';
import {SharedService} from '../../services/shared.service';
import {Item, ItemPurchase} from '../item/item';
import {AuctionItem} from '../auction/auction-item';
import {Auction} from '../auction/auction';
import {Report} from '../../utils/report.util';
import {ProfitSummary} from '../../utils/tsm-lua.util';


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
    console.log('upgrade', old);
    if (old && old['reagents'] && old['recipes']) {
      old['recipes'].forEach(recipe => {
        const r = SharedService.recipesMap[recipe.spellID];
        if (r) {
          this.add(r, recipe.quantity, true);
        }
      });

      this.save();
    }
  }

  import(data: object): void {
    if (SharedService.recipes.length === 0) {
      return;
    }
    // Import recipes
    if (data['recipes']) {
      data['recipes']
        .forEach(recipe => {
          const r = SharedService.recipesMap[recipe.id];
          if (!r) {
            Report.debug('ShoppingCart.import', recipe, r);
            return;
          }
          this.add(
            r,
            recipe.quantity,
            true);
        });
    }
  }

  setSources(): void {
    const realm = this.getUserRealm(),
      inventoryMap = SharedService.tsmAddonData.inventoryMap;
    let inventory;
    if (realm && inventoryMap && inventoryMap[realm.name]) {
      inventory = inventoryMap[realm.name];
    }

    this.sources.ah.length = 0;
    this.sources.inventory.length = 0;
    this.sources.vendor.length = 0;
    this.reagents
      .forEach((reagent: ShoppingCartItem) =>
        this.setSourcesForReagent(reagent, inventory));
  }

  private getUserRealm() {
    return SharedService.realms[SharedService.user.realm];
  }

  add(recipe: Recipe, quantity: number = 1, doNotSave?: boolean): void {
    if (this.recipeMap[recipe.spellID]) {
      (this.recipeMap[recipe.spellID] as ShoppingCartItem)
        .increment(quantity);
    } else {
      this.recipeMap[recipe.spellID] = new ShoppingCartItem(
        recipe.spellID, quantity, undefined, recipe.itemID);
      this.recipes.push(this.recipeMap[recipe.spellID]);
    }
    this.addReagents(recipe, quantity);
    this.calculateCosts();

    if (!doNotSave) {
      this.save();
    }
    Report.debug('ShoppingCart.add', recipe, quantity, this);
  }

  addReagents(recipe: Recipe, quantity: number = 1): void {
    recipe.reagents
      .forEach((reagent: Reagent) => {
        if (reagent.intermediateEligible && reagent.recipe.roi > 0) {
          this.add(reagent.recipe, quantity);
        } else {
          this.addReagent(reagent, quantity);
        }
      });
    this.setSources();
  }

  private addReagent(reagent: Reagent, quantity: number) {
    if (this.reagentMap[reagent.itemID]) {
      (this.reagentMap[reagent.itemID] as ShoppingCartItem)
        .increment(
          reagent.count * quantity);
    } else {
      const item = new ShoppingCartItem(
        reagent.itemID, reagent.count * quantity);
      this.reagentMap[reagent.itemID] = item;
      this.reagents.push(item);
    }
  }

  remove(id: number, quantity?: number): void {
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
  }

  private removeReagentForRecipe(reagent: Reagent, quantity: number) {
    if (this.reagentMap[reagent.itemID]) {
      const cartReagent = (this.reagentMap[reagent.itemID] as ShoppingCartItem);

      cartReagent.decrement(
        reagent.count * quantity);

      if (cartReagent.quantity <= 0) {
        this.removeFromList(cartReagent, this.reagents, this.reagentMap);
      }
    }
  }

  private removeFromList(cartItem: ShoppingCartItem, array: ShoppingCartItem[], map: object) {
    const index = array
      .findIndex((item) =>
        item === cartItem);
    array.splice(index, 1);
    delete map[cartItem.id];
  }

  private setSourcesForReagent(reagent: ShoppingCartItem, inventory: object) {
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
  }

  private handleInventorySource(inventory: object, reagent: ShoppingCartItem): number {
    let addedCount = 0;
    if (inventory && inventory[reagent.id]) {
      const i = inventory[reagent.id];
      if (i.quantity >= reagent.quantity) {
        addedCount += reagent.quantity;
        this.sources.inventory.push(reagent);
      } else {
        this.sources.inventory.push(
          new ShoppingCartItem(reagent.id, i.quantity));
        addedCount += i.quantity;
      }

      reagent.inventoryQuantity = inventory[reagent.id].quantity;
      this.setInventoryHistory(reagent, addedCount);

      Report.debug('ShoppingCart.handleInventorySource', inventory[reagent.id]);
    }
    return addedCount;
  }

  private setInventoryHistory(reagent: ShoppingCartItem, quantity: number) {
    if (!SharedService.tsmAddonData || !SharedService.tsmAddonData.profitSummary) {
      return;
    }

    const profitSummary: ProfitSummary = SharedService.tsmAddonData.profitSummary[this.getUserRealm().name],
      item = profitSummary.total.purchases.itemMap[reagent.id];
    let quantityFound = 0;

    if (!item) {
      return;
    }
    const history: ItemPurchase[] = [];

    item.history
      .forEach((purchase: ItemPurchase) => {
        history.push(purchase);
      });

    history
      .sort((a: ItemPurchase, b: ItemPurchase) =>
        a.buyout - b.buyout);
    Report.debug('ShoppingCart.history', history);

    history.forEach((purchase: ItemPurchase) => {
      if (quantity <= quantityFound) {
        return;
      }

      quantityFound += purchase.quantity;
      reagent.inventoryValue += purchase.buyout;
      reagent.avgCost = reagent.inventoryValue / reagent.quantity;
    });
  }

  calculateCosts(): void {
    this.sumCost = 0;
    this.sumTotalCost = 0;
    this.profit = 0;

    this.recipes.forEach(item => {
      const auctionItem: AuctionItem = SharedService.auctionItemsMap[item.itemID];
      if (auctionItem) {
        this.totalValue += auctionItem.buyout;
      }
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

    Report.debug('ShoppingCart.calculateCosts', this);
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
    if (auctionItem) {
      auctionItem.auctions.forEach((item: Auction) => {
        if (result.need.count >= quantity) {
          return;
        }


        if (item.quantity + result.need.count > quantity) {
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
      });
    }
    return result;
  }

  private handleVendorSource(reagent: ShoppingCartItem, currentQuantity: number): number {
    const item: Item = SharedService.items[reagent.id],
      auctionItem: AuctionItem = SharedService.auctionItemsMap[reagent.id],
      need = reagent.quantity - currentQuantity;

    if (this.isAvailableAtVendor(item) && this.isVendorCheaperThanAH(item, auctionItem)) {
      this.sources.vendor.push(new ShoppingCartItem(reagent.id, need));
      return need;
    }
    return 0;
  }

  private isVendorCheaperThanAH(item: Item, auctionItem: AuctionItem) {
    const source = item.itemSource;
    return !auctionItem || source && source.soldBy[0] && source.soldBy[0].cost < auctionItem.buyout;
  }

  private isAvailableAtVendor(item: Item): boolean {
    return item.itemSource && item.itemSource.soldBy && item.itemSource.soldBy.length > 0;
  }

  private handleAuctionSource(reagent: ShoppingCartItem, addedCount: number) {
    const need = reagent.quantity - addedCount,
      auctionItem: AuctionItem = SharedService.auctionItemsMap[reagent.id];

    if (need > 0 && auctionItem && auctionItem.quantityTotal > need) {
      const cartItem = new ShoppingCartItem(reagent.id, need);
      this.sources.ah.push(cartItem);
      return cartItem.quantity;
    }

    return 0;
  }

  private handleFarmSource(reagent: ShoppingCartItem, addedCount: number) {
    this.sources.farm.push(
      new ShoppingCartItem(reagent.id, reagent.quantity - addedCount));
  }

  clear() {
    this.recipes.length = 0;
    this.reagents.length = 0;
    this.reagentMap = {};
    this.recipeMap = {};
    this.tsmShoppingString = '';
    this.sumTotalCost = 0;
    this.sumCost = 0;
    this.profit = 0;
  }

  private save() {
    localStorage['shopping_cart'] = JSON.stringify({
      recipes: this.recipes
    });
  }

  private setShoppingString(): void {
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
  }
}

export class ShoppingCartItem {
  subCraft: ShoppingCartItem;
  cost = 0;
  avgCost = 0;
  totalCost = 0;
  totalCount = 0;

  inventoryValue = 0;
  inventoryQuantity = 0;

  constructor(public id: number, public quantity: number, private subRecipe?: Recipe, public itemID?: number) {
    if (subRecipe) {
      // this.subCraft = new ShoppingCartItem(subRecipe.spellID, );
    }
  }

  increment(quantity: number): void {
    this.quantity += quantity;
  }

  decrement(quantity: number): number {
    this.quantity -= quantity;
    return this.quantity;
  }
}
