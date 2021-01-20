import {Component, Input} from '@angular/core';
import {ShoppingCartV2} from '../../../models/shopping-cart-v2.model';
import {Theme} from '../../../../core/models/theme.model';
import {ThemeUtil} from '../../../../core/utils/theme.util';

@Component({
  selector: 'wah-summary',
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  @Input() cart: ShoppingCartV2;
  theme: Theme = ThemeUtil.current;
}
