import {Component, Input} from '@angular/core';
import {MenuItem} from '../../../models/menu-item.model';

@Component({
  selector: 'wah-menu-dropdown',
  templateUrl: './menu-dropdown.component.html'
})
export class MenuDropdownComponent {
  @Input() items: MenuItem[];
  @Input() parentPath: string;

  doNotClose(event: MouseEvent): void {
    if (event && event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
