import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ShoppingCartService} from '../services/shopping-cart.service';
import {MatDialog} from '@angular/material/dialog';
import {CartDialogComponent} from './cart-dialog/cart-dialog.component';
import {CartItem, CartRecipe, ShoppingCartV2} from '../models/shopping-cart-v2.model';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cart: ShoppingCartV2;
  items: CartItem[] = [];
  recipes: CartRecipe[] = [];
  sm = new SubscriptionManager();

  /*
  columns = {
    recipes: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Qty', dataType: 'cart-recipe-count'},
      {key: 'buyout', title: 'Buyout', dataType: 'gold'},
      {key: '', title: '', dataType: 'cart-delete'}
    ],
    neededReagents :  [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Qty', dataType: 'number'},
      {key: 'buyout', title: 'Min buyout', dataType: 'gold'},
      {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'}
    ],
    ah: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Qty', dataType: 'number'},
      {key: 'buyout', title: 'Min buyout', dataType: 'gold'},
      {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'},
      {key: 'totalCost', title: 'Total', dataType: 'gold'}
    ],
    vendor: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Qty', dataType: 'number'},
      {key: 'avgCost', title: 'Avg buyout', dataType: 'gold'},
      {key: 'totalCost', title: 'Total', dataType: 'gold'}
    ],
    farm: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Qty', dataType: 'number'}
    ],
    inventory: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'quantity', title: 'Need', dataType: 'number'},
      {key: 'inventoryQuantity', title: 'Have', dataType: 'number'},
      {key: 'avgCost', title: 'Avg item cost', dataType: 'gold'},
      {key: 'inventoryValue', title: 'Total cost', dataType: 'gold'},
      {key: 'characters', title: 'Characters', dataType: 'array'}
    ]
  };
  */

  constructor(private service: ShoppingCartService, private dialog: MatDialog) {
    this.sm.add(this.service.items, (items) => this.items = items);
    this.sm.add(this.service.recipes, (recipes) => this.recipes = recipes);
    this.sm.add(service.cart, cart => this.cart = cart);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  toggleDialog() {
    this.dialog.open(CartDialogComponent,
      {
        width: '95%',
        maxWidth: '100%',
      });
  }
}
