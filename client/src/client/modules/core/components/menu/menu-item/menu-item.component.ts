import {Component, Input} from '@angular/core';
import {MenuItem} from '../../../models/menu-item.model';

@Component({
  selector: 'wah-menu-item',
  templateUrl: './menu-item.component.html'
})
export class MenuItemComponent {
  @Input() item: MenuItem;
  @Input() parentPath: string;
}
