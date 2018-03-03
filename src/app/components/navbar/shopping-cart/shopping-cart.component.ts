import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ShoppingCart, ShoppingCartRecipe } from '../../../models/shopping-cart';
import { User } from '../../../models/user/user';
import { Recipe } from '../../../models/crafting/recipe';
import { ColumnDescription } from '../../../models/column-description';
import { Angulartics2 } from 'angulartics2';
import { AuctionItem } from '../../../models/auction/auction-item';
import { GoldPipe } from '../../../pipes/gold.pipe';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {

  show: boolean;
  columnsRecipes: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'quantity', title: 'Qty', dataType: 'number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: '', title: '', dataType: 'cart-delete' }
  ];
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'quantity', title: 'Qty', dataType: 'number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' }
  ];

  constructor(private angulartics2: Angulartics2) { }

  ngOnInit() {
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

  setShow(): void {
    setTimeout(() => {
      this.show = true;
    }, 1);
  }
}
