import {CartItem, CartRecipe, ShoppingCartV2} from '../models/shopping-cart-v2.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Recipe} from '../../crafting/models/recipe';
import {Reagent} from '../../crafting/models/reagent';
import {OptimisticCraftingUtil} from '../../crafting/utils/optimistic-crafting.util';
import {PessimisticCraftingUtil} from '../../crafting/utils/pessimistic-crafting.util';
import {NeededCraftingUtil} from '../../crafting/utils/needed-crafting.util';
import {BaseCraftingUtil} from '../../crafting/utils/base-crafting.util';
import {SharedService} from '../../../services/shared.service';

export class ShoppingCartUtil {
  public strategy: BaseCraftingUtil;

  calculateSources(recipeMap: Map<number, Recipe>, auctionMap: Map<string, AuctionItem>,
                   recipes: CartRecipe[] = [], items: CartItem[] = []): ShoppingCartV2 {
    const STRATEGY = BaseCraftingUtil.STRATEGY,
      selectedStrategy = SharedService.user.craftingStrategy;
    const cart = new ShoppingCartV2();
    const neededitems = this.getNeededItems(recipeMap, recipes, items);
    const tmpRecipe: Recipe = new Recipe();
    tmpRecipe.reagents = neededitems.map(
      ({id, quantity}) => new Reagent(id, quantity));
    switch (selectedStrategy) {
      case STRATEGY.OPTIMISTIC:
        this.strategy = new OptimisticCraftingUtil(auctionMap);
        break;
      case STRATEGY.PESSIMISTIC:
        this.strategy = new PessimisticCraftingUtil(undefined, undefined, auctionMap);
        break;
      default:
        this.strategy = new NeededCraftingUtil(auctionMap);
        break;
    }
    this.strategy.calculateOne(tmpRecipe);
    console.log('TMP recipe', tmpRecipe);

    cart.neededItems = tmpRecipe.reagents;
    cart.profit = tmpRecipe.roi;
    cart.sumCost = tmpRecipe.cost;

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
}
