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
