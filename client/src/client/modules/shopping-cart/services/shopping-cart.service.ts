import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CartItem, CartRecipe, ShoppingCartV2} from '../models/shopping-cart-v2.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../services/auctions.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {ShoppingCartUtil} from '../utils/shopping-cart.util';
import {CraftingService} from '../../../services/crafting.service';
import {Recipe} from '../../crafting/models/recipe';
import {ErrorReport} from '../../../utils/error-report.util';
import {ItemService} from '../../../services/item.service';
import {BackgroundDownloadService} from '../../core/services/background-download.service';
import {Report} from '../../../utils/report.util';
import {AppSyncService} from '../../user/services/app-sync.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private util = new ShoppingCartUtil();
  private STORAGE_NAME = 'shopping_cart_';
  cart: BehaviorSubject<ShoppingCartV2> = new BehaviorSubject<ShoppingCartV2>(undefined);
  items: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  itemsMap: BehaviorSubject<Map<number, CartItem>> = new BehaviorSubject<Map<number, CartItem>>(new Map<number, CartItem>());
  recipes: BehaviorSubject<CartRecipe[]> = new BehaviorSubject<CartRecipe[]>([]);
  recipesMap: BehaviorSubject<Map<number, CartRecipe>> = new BehaviorSubject<Map<number, CartRecipe>>(new Map<number, CartRecipe>());

  private sm = new SubscriptionManager();

  constructor(private auctionService: AuctionsService,
              private backgroundService: BackgroundDownloadService,
              private appSyncService: AppSyncService,
              ) {
    this.restore();
    this.sm.add(auctionService.mapped,
      (map: Map<string, AuctionItem>) => this.calculateCart(map));

    this.sm.add(backgroundService.isInitialLoadCompleted,
      (isDone) => {
        if (isDone) {
          this.calculateCart();
        }
      });
  }

  private restore(): void {
    const items = localStorage.getItem(this.STORAGE_NAME + 'items');
    const recipes = localStorage.getItem(this.STORAGE_NAME + 'recipes');

    if (items) {
      try {
        const map = new Map<number, CartItem>();
        this.items.next(JSON.parse(items));
        this.items.value.forEach(item => map.set(item.id, item));
        this.itemsMap.next(map);
      } catch (error) {
        ErrorReport.sendError('ShoppingCartService.restore items', error);
      }
    }
    if (recipes) {
      try {
        const map = new Map<number, CartRecipe>();
        this.recipes.next(JSON.parse(recipes));
        this.recipes.value.forEach(recipe => map.set(recipe.id, recipe));
        this.recipesMap.next(map);
      } catch (error) {
        ErrorReport.sendError('ShoppingCartService.restore recipes', error);
      }
    }
  }

  addRecipeByItemId(id: number, quantity: number): void {
    const auctionItem: AuctionItem = this.auctionService.mapped.value.get('' + id);
    if (auctionItem && auctionItem.source && auctionItem.source.recipe && auctionItem.source.recipe.known) {
      const recipe: Recipe = auctionItem.source.recipe.known[0];
      this.addRecipe(recipe.id, quantity);
    }
  }

  addRecipe(id: number, quantity: number): void {
    let list: CartRecipe[] = this.recipes.value;
    const map: Map<number, CartRecipe> = this.recipesMap.value;

    if (map.has(id)) {
      map.get(id).quantity += quantity;
      list = this.removeRecipeIfQuantityIsZero(map, id, list);
    } else {
      map.set(id, {
        id,
        quantity,
        isIntermediate: false
      });
      list.push(map.get(id));
    }

    this.recipesMap.next(map);
    this.recipes.next([
      ...list
    ]);
    this.calculateCart();
    this.saveRecipes();
    this.updateAppSync();
  }

  private updateAppSync() {
    this.appSyncService.updateSettings({
      shoppingCart: {
        recipes: this.recipes.value,
        items: this.items.value,
      }
    });
  }

  private saveRecipes() {
    localStorage.setItem(this.STORAGE_NAME + 'recipes', JSON.stringify(this.recipes.value));
  }

  private removeRecipeIfQuantityIsZero(map: Map<number, CartRecipe>, id: number, list: CartRecipe[]) {
    if (map.get(id).quantity <= 0) {
      list = list.filter(recipe => recipe.id !== id);
      map.delete(id);
      Report.send('Removed recipe', 'Shopping cart');
    } else {
      Report.send('Added recipe', 'Shopping cart');
    }
    return list;
  }

  addItem(id: number, quantity: number): void {
    let list: CartItem[] = this.items.value;
    const map: Map<number, CartItem> = this.itemsMap.value;

    if (map.has(id)) {
      map.get(id).quantity += quantity;
      list = this.removeItemIfQuantityIsZero(map, id, list);
    } else {
      map.set(id, {
        id,
        quantity,
        isReagent: false
      });
      list.push(map.get(id));
    }
    this.itemsMap.next(map);
    this.items.next([
      ...list
    ]);
    this.calculateCart();
    this.saveItems();
    this.updateAppSync();
  }

  private saveItems() {
    localStorage.setItem(this.STORAGE_NAME + 'items', JSON.stringify(this.items.value));
  }

  private removeItemIfQuantityIsZero(map: Map<number, CartItem>, id: number, list: CartItem[]): CartItem[] {
    if (map.get(id).quantity <= 0) {
      list = list.filter(item => item.id !== id);
      map.delete(id);
      Report.send('Removed item', 'Shopping cart');
    } else {
      Report.send('Added item', 'Shopping cart');
    }
    return list;
  }

  private calculateCart(map: Map<string, AuctionItem> = this.auctionService.mapped.value, useInventory: boolean = true) {
    this.cart.next(this.util.calculateSources(
      CraftingService.map.value,
      map,
      ItemService.mapped.value,
      useInventory,
      this.recipes.value,
      this.items.value
    ));
  }

  clear() {
    const itemMap: Map<number, CartItem> = new Map<number, CartItem>();
    this.itemsMap.next(itemMap);
    const itemList: CartItem[] = [];
    this.items.next(itemList);
    const recipeMap: Map<number, CartRecipe> =  new Map<number, CartRecipe>();
    this.recipesMap.next(recipeMap);
    const recipeList: CartRecipe[] = [];
    this.recipes.next(recipeList);
    this.calculateCart();
    this.saveRecipes();
    this.saveItems();
    this.updateAppSync();
  }
}
