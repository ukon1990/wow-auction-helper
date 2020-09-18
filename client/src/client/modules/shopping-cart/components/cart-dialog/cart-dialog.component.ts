import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ShoppingCartService} from '../../services/shopping-cart.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CartItem, CartRecipe, ShoppingCartV2} from '../../models/shopping-cart-v2.model';

@Component({
  selector: 'wah-cart-dialog',
  templateUrl: './cart-dialog.component.html',
  styleUrls: ['./cart-dialog.component.scss']
})
export class CartDialogComponent implements OnInit, OnDestroy {
  sm = new SubscriptionManager();
  items: CartItem[] = [];
  recipes: CartRecipe[] = [];
  cart: ShoppingCartV2;

  constructor(public dialogRef: MatDialogRef<CartDialogComponent>,
              private service: ShoppingCartService) {
    this.sm.add(this.service.items, (items) => this.items = items);
    this.sm.add(this.service.recipes, (recipes) => this.recipes = recipes);
    this.sm.add(this.service.cart, (cart) => this.cart = cart);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }
}
