import {Component, Input} from '@angular/core';
import {ShoppingCartV2} from '../../../models/shopping-cart-v2.model';

@Component({
  selector: 'wah-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
  @Input() cart: ShoppingCartV2;
}
