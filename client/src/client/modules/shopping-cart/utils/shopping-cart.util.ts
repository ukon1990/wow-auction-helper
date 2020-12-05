import {CartItem, CartRecipe, CartSources, ShoppingCartV2} from '../models/shopping-cart-v2.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Recipe} from '../../crafting/models/recipe';
import {Reagent, ReagentSource} from '../../crafting/models/reagent';
import {OptimisticCraftingUtil} from '../../crafting/utils/optimistic-crafting.util';
import {PessimisticCraftingUtil} from '../../crafting/utils/pessimistic-crafting.util';
import {NeededCraftingUtil} from '../../crafting/utils/needed-crafting.util';
import {BaseCraftingUtil} from '../../crafting/utils/base-crafting.util';
import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';

export class ShoppingCartUtil {
  public strategy: BaseCraftingUtil;

  calculateSources(recipeMap: Map<number, Recipe>,
                   auctionMap: Map<string, AuctionItem>,
                   itemMap: Map<number, Item>,
                   useInventory: boolean,
                   recipes: CartRecipe[] = [],
                   items: CartItem[] = []): ShoppingCartV2 {
    const STRATEGY = BaseCraftingUtil.STRATEGY,
      selectedStrategy = SharedService.user ? SharedService.user.craftingStrategy : STRATEGY,
      faction = SharedService.user.faction;
    const cart = new ShoppingCartV2();
    const neededItems = this.getNeededItems(recipeMap, recipes, items);
    const tmpRecipe: Recipe = new Recipe();
    tmpRecipe.reagents = neededItems.map(
      ({id, quantity}) => new Reagent(id, quantity));
    switch (selectedStrategy || STRATEGY) {
      case STRATEGY.OPTIMISTIC:
        this.strategy = new OptimisticCraftingUtil(auctionMap, itemMap, faction, false, useInventory);
        break;
      case STRATEGY.PESSIMISTIC:
        this.strategy = new PessimisticCraftingUtil(auctionMap, itemMap, faction, false, useInventory);
        break;
      default:
        this.strategy = new NeededCraftingUtil(auctionMap, itemMap, faction, false, useInventory);
        break;
    }
    this.strategy.calculateOne(tmpRecipe);

    cart.neededItems = tmpRecipe.reagents;
    cart.sumCost = tmpRecipe.cost;
    cart.sources = this.collectSources(tmpRecipe.reagents);
    cart.neededItems.sort((a, b) => b.avgPrice - a.avgPrice);

    cart.sumTotalCost = this.getSumTotalCost(cart.neededItems, auctionMap);
    cart.sumEstimatedInventoryCost = this.calculateEstInventoryValue(cart.sources.inventory);
    cart.totalValue = this.getTotalValue(recipeMap, recipes, items, auctionMap);
    cart.profit = cart.totalValue - cart.sumCost;
    cart.tsmShoppingString = this.getTsmString(cart.sources.ah, itemMap);

    return cart;
  }

  private getNeededItems(recipeMap: Map<number, Recipe>, recipes: CartRecipe[], items: CartItem[]) {
    const needed: CartItem[] = [];
    const map = new Map<number, CartItem>();
    (recipes || []).forEach(({id, quantity, isIntermediate}: CartRecipe) =>
      this.handleRecipe(recipeMap, id, quantity, map, needed));

    (items || []).forEach(({id, quantity}: CartItem) =>
      this.handleCartItem(id, quantity, map, needed));

    return needed;
  }

  private handleRecipe(recipeMap: Map<number, Recipe>, id: number, quantity: number, map: Map<number, CartItem>, needed: CartItem[]) {
    const recipe = recipeMap.get(id);
    if (recipe) {
      recipe.reagents.forEach((reagent: Reagent) => {
        const neededQuantity: number = reagent.quantity * quantity;
        if (!map.get(reagent.id)) {
          map.set(reagent.id,
            {
              id: reagent.id,
              quantity: neededQuantity,
              isReagent: true
            });
          needed.push(map.get(reagent.id));
        } else {
          map.get(reagent.id).quantity += neededQuantity;
        }
      });
    }
  }

  private handleCartItem(id: number, quantity: number, map: Map<number, CartItem>, needed: CartItem[]) {
    if (!map.get(id)) {
      map.set(id,
        {
          id,
          quantity,
          isReagent: false
        });
      needed.push(map.get(id));
    } else {
      map.get(id).quantity += quantity;
    }
  }

  private collectSources(reagents: Reagent[]): CartSources {
    const result: CartSources = {
      ah: [],
      farm: [],
      inventory: [],
      vendor: [],
      intermediate: [],
      override: [],
      tradeVendor: []
    };

    reagents.forEach(reagent => {
      const {sources} = reagent;
      Object.keys(sources)
        .forEach(key => {
          if (sources[key].quantity) {
            result[key].push({...sources[key], id: reagent.id});
          }
        });
    });

    Object.keys(result)
      .forEach(key => {
        result[key].sort((a: ReagentSource, b: ReagentSource) => b.sumPrice - a.sumPrice);
      });

    return result;
  }

  private getSumTotalCost(needed: Reagent[], auctionMap: Map<string, AuctionItem>): number {
    let sum = 0;

    needed.forEach(reagent => {
      if (auctionMap.has('' + reagent.id)) {
        sum += reagent.avgPrice * reagent.quantity;
      }
    });

    return sum;
  }

  private getTotalValue(recipeMap: Map<number, Recipe>, recipes: CartRecipe[], items: CartItem[], auctionMap: Map<string, AuctionItem>) {
    let sum = 0;

    recipes.forEach(recipe => {
      const rec: Recipe = recipeMap.get(recipe.id);
      if (rec && auctionMap.has('' + rec.itemID)) {
        sum += auctionMap.get('' + rec.itemID).buyout * +recipe.quantity;
      }
    });
    items.forEach(item => {
      if (auctionMap.has('' + item.id)) {
        sum += auctionMap.get('' + item.id).buyout * +item.quantity;
      }
    });

    return sum;
  }

  private calculateEstInventoryValue(inventory: ReagentSource[]) {
    let value = 0;

    inventory.forEach(item => {
      value += item.sumPrice;
    });

    return value;
  }

  private getTsmString(ah: ReagentSource[], items: Map<number, Item>): string {
    return ah.map(reagent => {
      const item: Item = items.get(reagent.id);
      return `${item ? item.name : ('i:' + reagent.id)}/exact/x${reagent.quantity}`;
    }).join(';');
  }
}
