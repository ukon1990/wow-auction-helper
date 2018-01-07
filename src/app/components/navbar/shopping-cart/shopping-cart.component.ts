import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ShoppingCart } from '../../../models/shopping-cart';
import { User } from '../../../models/user/user';

@Component({
  selector: 'wah-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {

  show: boolean;

  constructor() { }

  ngOnInit() {
  }

  getShoppingCart(): ShoppingCart {
    return SharedService.shoppingCart;
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
