import {Component, OnDestroy, OnInit} from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ShoppingCart, ShoppingCartRecipe } from '../../../models/shopping-cart';
import { User } from '../../../models/user/user';
import { Recipe } from '../../../models/crafting/recipe';
import { ColumnDescription } from '../../../models/column-description';
import { Angulartics2 } from 'angulartics2';
import {SubscriptionsUtil} from '../../../utils/subscriptions.util';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  show: boolean;
  columnsRecipes: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'quantity', title: 'Qty', dataType: 'input-number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: '', title: '', dataType: 'cart-delete' }
  ];
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'quantity', title: 'Qty', dataType: 'number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' }
  ];
  subscriptions = new SubscriptionsUtil();

  constructor(private angulartics2: Angulartics2) { }

  ngOnInit() {
    // TSM import thingy
    // Auksjoner
    // Shopping cart

    this.subscriptions.add(
      SharedService.events.shopingCart,
      (data) => this.handleShoppingCartUpdate(data)
    );

    this.subscriptions.add(
      SharedService.events.tsmDataRestored,
      () => this.handleTSMAddonDataUpdate()
    );

    this.subscriptions.add(
      SharedService.events.auctionUpdate,
      () => this.handleAHUpdate()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getRecipe(spellID: number): Recipe {
    return SharedService.recipesMap[spellID] ?
      SharedService.recipesMap[spellID] : new Recipe();
  }

  getShoppingCart(): ShoppingCart {
    return SharedService.user.shoppingCart;
  }

  removeRecipeFromCart(recipe: ShoppingCartRecipe, index: number): void {
    this.getShoppingCart().removeRecipe(recipe, index);
  }

  clearShoppingCart(): void {
    this.getShoppingCart().clear();
    this.angulartics2.eventTrack.next({
      action: 'Cleared cart',
      properties: { category: 'Shopping cart' },
    });
  }

  getUser(): User {
    return SharedService.user;
  }

  toggleDisplay(): void {
    this.show = !this.show;
  }

  private handleShoppingCartUpdate(data: any) {
    return undefined;
  }

  private handleAHUpdate() {
    return undefined;
  }

  private handleTSMAddonDataUpdate() {
    return undefined;
  }
}
