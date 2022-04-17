import {CartItem, CartRecipe} from '../models/shopping-cart-v2.model';
import {CraftingService} from '../../../services/crafting.service';
import {Recipe} from '../../crafting/models/recipe';
import {ItemService} from '../../../services/item.service';
import {Item} from '@shared/models';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Reagent} from '../../crafting/models/reagent';

export class CartTransformUtil {

  static recipes(value: CartRecipe[], auctions: Map<string, AuctionItem>, reagents: Reagent[]) {
    const mapReagents = new Map<number, Reagent>();
    reagents.forEach(reagent => mapReagents.set(reagent.id, reagent));

    return value.map(entry => {
      const recipe: Recipe = CraftingService.map.value.get(entry.id);
      const ai: AuctionItem = auctions.get('' + recipe.itemID);
      const buyout: number = ai ? ai.buyout : 0;
      const cost: number = recipe.reagents.reduce((sum, reagent) => {
        const mappedReagent = mapReagents.get(reagent.id);
        if (!mappedReagent || !mappedReagent.avgPrice) {
          return sum || 0;
        }
        return (mappedReagent.avgPrice * reagent.quantity) + sum;
      }, 0);
      const roi: number = buyout - cost;
      return {
        ...entry,
        itemId: recipe ? recipe.itemID : undefined,
        name: recipe ? recipe.name : '',
        buyout,
        cost,
        roi,
        sumRoi: roi * entry.quantity,
      };
    });
  }

  static items(value: CartItem[], auctions: Map<string, AuctionItem>) {
    return value.map(entry => {
      const item: Item = ItemService.mapped.value.get(entry.id);
      const ai: AuctionItem = auctions.get('' + entry.id);
      return {
        ...entry,
        name: item ? item.name : '',
        buyout: ai ? ai.buyout : 0,
      };
    });
  }

  static needed(neededItems: Reagent[]) {
    return (neededItems || [])
      .map(reagent => {
        const item: Item = ItemService.mapped.value.get(reagent.id);
        return {
          ...reagent,
          name: item ? item.name : '',
        };
      });
  }
}