import {GoldPipe} from '../pipes/gold.pipe';
import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {SharedService} from '../services/shared.service';
import {Item} from '../models/item/item';
import {AuctionItem} from '../models/auction/auction-item';

export class ShoppingCartUtil {
  /**
   * TODO: Import old shopping list type to new one before release!!!
   */
  private pipe: GoldPipe = new GoldPipe();

  setCart(): void {
  }

  isVendor(id: number): boolean {
    return false;
  }

  shouldBuyFromAH(id: number): boolean {
    return false;
  }

  isInInventory(id: number): boolean {
    return false;
  }
}

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
    vendor: []
  };

  constructor() {

  }

  upgrade(old: any): void {
    // TODO: Do this
  }

  private setSources(): void {
    const realm = SharedService.realms[SharedService.user.realm];
    let inventory;
    if (realm && SharedService.tsmAddonData.inventoryMap[realm.name]) {
      inventory = SharedService.tsmAddonData.inventoryMap[realm.name];
    }

    this.sources.ah.length = 0;
    this.sources.inventory.length = 0;
    this.sources.vendor.length = 0;
    this.reagents
      .forEach((reagent: ShoppingCartItem) =>
        this.setSourcesForReagent(reagent, inventory));
  }

  add(recipe: Recipe, quantity: number = 1): void {
    if (this.recipeMap[recipe.spellID]) {
      (this.recipeMap[recipe.spellID] as ShoppingCartItem)
        .increment(quantity);
    } else {
      this.recipeMap[recipe.spellID] = new ShoppingCartItem(
        recipe.spellID, quantity);
      this.recipes.push(this.recipeMap[recipe.spellID]);
    }
    this.addReagents(recipe, quantity);
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
      addedCount += this.handleVendorSource(reagent);
    }

    if (addedCount < reagent.quantity) {

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
    }
    return addedCount;
  }

  private handleVendorSource(reagent: ShoppingCartItem, currentQuantity: number): number {
    const item: Item = SharedService.items[reagent.id],
      auctionItem: AuctionItem = SharedService.auctionItemsMap[reagent.id];
    let addedCount = 0;

    if (this.isAvailableAtVendor(item)) {
      // TODO: Verify that the vendor item is actually cheaper also
      addedCount = reagent.quantity - currentQuantity;
    }

    return addedCount;
  }

  private isAvailableAtVendor(item: Item): boolean {
    return item.itemSource && item.itemSource.soldBy && item.itemSource.soldBy.length > 0;
  }
}

export class ShoppingCartItem {
  subCraft: ShoppingCartItem;

  constructor(public id: number, public quantity: number, private subRecipe?: Recipe) {
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
