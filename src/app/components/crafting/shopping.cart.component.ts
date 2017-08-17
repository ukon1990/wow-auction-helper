import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUser } from '../../utils/interfaces';

@Component({
	selector: 'app-shopping-cart',
	templateUrl: 'shopping.cart.component.html'
})

export class ShoppingCartComponent {
	@Input() shoppingCart: any;
	@Input() user: IUser;
	@Input() getMinPrice: Function;
	@Output() clearCart = new EventEmitter();
	@Output() removeFromCart = new EventEmitter();
	constructor() { }
}
