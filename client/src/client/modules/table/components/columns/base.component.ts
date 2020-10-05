import {Component, Input} from '@angular/core';
import {ColumnDescription} from '../../models/column-description';

@Component({template: ''})
export class BaseComponent {
  @Input() row: any;
  @Input() column: ColumnDescription;
  @Input() locale: string;
  @Input() idName: string;
}
