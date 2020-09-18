import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CartItem, CartRecipe, ShoppingCartV2} from '../models/shopping-cart-v2.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../services/auctions.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {ShoppingCartUtil} from '../utils/shopping-cart.util';
import {CraftingService} from '../../../services/crafting.service';
import {Recipe} from '../../crafting/models/recipe';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private util = new ShoppingCartUtil();
  cart: BehaviorSubject<ShoppingCartV2> = new BehaviorSubject<ShoppingCartV2>(undefined);
  items: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  recipes: BehaviorSubject<CartRecipe[]> = new BehaviorSubject<CartRecipe[]>([]);

  private sm = new SubscriptionManager();

  constructor(private auctionService: AuctionsService, private craftingService: CraftingService) {
    this.sm.add(auctionService.mapped,
      (map: Map<string, AuctionItem>) => this.calculateCart(map));
  }

  addRecipeByItemId(id: number, quantity: number): void {
    const auctionItem: AuctionItem = this.auctionService.mapped.value.get('' + id);
    if (auctionItem && auctionItem.source && auctionItem.source.recipe && auctionItem.source.recipe.known) {
      const recipe: Recipe = auctionItem.source.recipe.known[0];
      this.addRecipe(recipe.id, quantity);
    }
  }

  addRecipe(id: number, quantity: number): void {
    const list: CartRecipe[] = this.recipes.value;
    const existingInList: CartRecipe[] = list.filter(r => r.id === id);

    if (existingInList.length) {
      existingInList[0].quantity += quantity;
    } else {
      list.push({
        id,
        quantity,
        isIntermediate: false
      });
    }

    this.recipes.next([
      ...list
    ]);
    this.calculateCart();
  }

  addItem(id: number, quantity: number): void {
    const list: CartItem[] = this.items.value;
    const existingInList: CartItem[] = list.filter(r => r.id === id);

    if (existingInList.length) {
      existingInList[0].quantity += quantity;
    } else {
      list.push({
        id,
        quantity,
        isReagent: false
      });
    }

    this.calculateCart();
  }

  private calculateCart(map: Map<string, AuctionItem> = this.auctionService.mapped.value) {
    this.cart.next(this.util.calculateSources(
      CraftingService.map.value,
      map,
      this.recipes.value,
      this.items.value
    ));
  }
}
