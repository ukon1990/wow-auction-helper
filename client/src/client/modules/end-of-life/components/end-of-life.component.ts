import {Component} from '@angular/core';
import {Theme} from '../../core/models/theme.model';
import {ThemeUtil} from '../../core/utils/theme.util';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'wah-end-of-life',
  templateUrl: './end-of-life.component.html',
  styles: [
    `
        .list-item-line-break {
            white-space: break-spaces !important;
        }
    `
  ]
})
export class EndOfLifeComponent {
  theme: Theme = ThemeUtil.current;
  endOfService = environment.endOfService;

}