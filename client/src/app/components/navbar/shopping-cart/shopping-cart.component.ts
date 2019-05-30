import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedService} from '../../../services/shared.service';
import {User} from '../../../models/user/user';
import {Recipe} from '../../../models/crafting/recipe';
import {ColumnDescription} from '../../../models/column-description';
import {Report} from '../../../utils/report.util';
import {ShoppingCart} from '../../../models/shopping/shopping-cart.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cart: ShoppingCart = SharedService.user.shoppingCart;

  show: boolean;
  columnsRecipes: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'cart-recipe-count'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: '', title: '', dataType: 'cart-delete'}
  ];
  columnsNeededReagents: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'},
    {key: 'buyout', title: 'Min buyout', dataType: 'gold'},
    {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'}
  ];

  columnsAH: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'},
    {key: 'buyout', title: 'Min buyout', dataType: 'gold'},
    {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'},
    {key: 'totalCost', title: 'Total', dataType: 'gold'}
  ];

  columnsVendor: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'},
    {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'},
    {key: 'totalCost', title: 'Total', dataType: 'gold'}
  ];

  columnsFarm: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Qty', dataType: 'number'}
  ];

  columnsInventory: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Need', dataType: 'number'},
    {key: 'inventoryQuantity', title: 'Have', dataType: 'number'},
    {key: 'avgCost', title: 'Avg item cost', dataType: 'gold'},
    {key: 'inventoryValue', title: 'Total cost', dataType: 'gold'},
    {key: 'characters', title: 'Characters', dataType: 'array'}
  ];

  subscriptions = new SubscriptionManager();

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

    this.subscriptions.add(
      SharedService.events.recipes,
      () =>
        this.setCart());
  }

  private setCart() {
    SharedService.user.shoppingCart = new ShoppingCart();
    this.cart = SharedService.user.shoppingCart;
    this.cart.setSources();
    this.cart.calculateCosts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getRecipe(spellID: number): Recipe {
    return SharedService.recipesMap[spellID] ?
      SharedService.recipesMap[spellID] : new Recipe();
  }

  clearShoppingCart(): void {
    this.cart.clear();
  }

  getUser(): User {
    return SharedService.user;
  }

  toggleDisplay(): void {
    this.show = !this.show;
    Report.send(
      this.show ? 'Shopping cart opened' : 'Shopping cart closed',
      'Shopping cart');
  }

  private handleShoppingCartUpdate(data: any) {
  }

  private handleAHUpdate() {
    // Update need to be bought costs
    // Make sure to split vendor items into it's own list
    this.cart.setSources();
    this.cart.calculateCosts();
  }

  private handleTSMAddonDataUpdate() {
    // Update inventory status
    this.setCart();
    return undefined;
  }
}
