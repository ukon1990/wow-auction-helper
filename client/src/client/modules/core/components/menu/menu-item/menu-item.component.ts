import {Component, Input} from '@angular/core';
import {MenuItem} from '../../../models/menu-item.model';

@Component({
  selector: 'wah-menu-item',
  templateUrl: './menu-item.component.html',
  styles: [`
    :not(.mat-accent) .button-color {
        color: white;
    }
  `]
})
export class MenuItemComponent {
  @Input() item: MenuItem;
  @Input() parentPath: string;
}