import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ShoppingCartService} from '../../services/shopping-cart.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CartItem, CartRecipe, ShoppingCartV2} from '../../models/shopping-cart-v2.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {BackgroundDownloadService} from '../../../core/services/background-download.service';
import {CartTransformUtil} from '../../utils/cart-transform.util';
import {AuctionsService} from '../../../../services/auctions.service';
import {Reagent} from '../../../crafting/models/reagent';

@Component({
  selector: 'wah-cart-dialog',
  templateUrl: './cart-dialog.component.html',
  styleUrls: ['./cart-dialog.component.scss']
})
export class CartDialogComponent implements OnInit, OnDestroy {
  sm = new SubscriptionManager();
  items: CartItem[] = [];
  recipes: CartRecipe[] = [];
  needed: Reagent[] = [];
  cart: ShoppingCartV2;
  recipeColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Name',
      dataType: 'name',
      options: {
        idName: 'itemId'
      }
    },
    {
      key: 'buyout',
      title: 'Lowest buyout',
      dataType: 'gold'
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataType: 'number'
    },
  ];
  itemColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Name',
      dataType: 'name',
      options: {
        idName: 'id'
      }
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataType: 'number'
    },
    {
      key: 'buyout',
      title: 'Lowest buyout',
      dataType: 'gold'
    },
  ];
  neededColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Name',
      dataType: 'name',
      options: {
        idName: 'itemId'
      }
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataType: 'number'
    },
    {
      key: 'avgPrice',
      title: 'Avg buyout',
      dataType: 'gold'
    },
    {
      key: 'sumPrice',
      title: 'Sum buyout',
      dataType: 'gold'
    },
  ];

  sourceColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Name',
      dataType: 'name',
      options: {
        idName: 'id'
      }
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataType: 'number'
    },
    {
      key: 'price',
      title: 'Avg buyout',
      dataType: 'gold'
    },
    {
      key: 'sumPrice',
      title: 'Sum buyout',
      dataType: 'gold'
    },
  ];

  constructor(public dialogRef: MatDialogRef<CartDialogComponent>,
              private service: ShoppingCartService,
              private auctionService: AuctionsService,
              private backgroundService: BackgroundDownloadService) {
    this.sm.add(this.service.items, () => this.setItems());
    this.sm.add(this.service.recipes, () => this.setRecipes());
    this.sm.add(this.service.cart, (cart: ShoppingCartV2) => {
      this.cart = cart;
      this.setRecipes();
      this.setItems();
      this.needed = CartTransformUtil.needed(cart.neededItems);
    });
    this.sm.add(this.backgroundService.isInitialLoadCompleted, isDone => {
      if (isDone) {
        this.setRecipes();
        this.setItems();
      }
    });
  }

  private setRecipes() {
    this.recipes = CartTransformUtil.recipes(
      this.service.recipes.value, this.auctionService.mapped.value);
  }

  private setItems() {
    this.items = CartTransformUtil.items(
      this.service.items.value, this.auctionService.mapped.value);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }
}
