import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedService} from '../../../services/shared.service';
import {ShoppingCart, ShoppingCartRecipe} from '../../../models/shopping-cart';
import {User} from '../../../models/user/user';
import {Recipe} from '../../../models/crafting/recipe';
import {ColumnDescription} from '../../../models/column-description';
import {Angulartics2} from 'angulartics2';
import {SubscriptionsUtil} from '../../../utils/subscriptions.util';
import {Report} from '../../../utils/report.util';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  show: boolean;
  columnsRecipes: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'input-number'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: '', title: '', dataType: 'cart-delete'}
  ];
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'}
  ];

  columnsInventory: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'},
    {key: 'characters', title: 'Characters', dataType: 'string'}
  ];

  subscriptions = new SubscriptionsUtil();

  constructor() {
  }

  ngOnInit() {

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
    Report.send('Cleared cart', 'Shopping cart');
  }

  getUser(): User {
    return SharedService.user;
  }

  toggleDisplay(): void {
    this.show = !this.show;
  }

  private handleShoppingCartUpdate(data: any) {
    // Make sure to split stuff into three lists
    // - Vendor bought
    // - Buy from AH
    // - Got it in my inventory
  }

  private handleAHUpdate() {
    // Update need to be bought costs
    // Make sure to split vendor items into it's own list
  }

  private handleTSMAddonDataUpdate() {
    // Update inventory status
    return undefined;
  }
}
