import {Component, Input} from '@angular/core';
import {TableUtil} from '../../utils/table.util';
import {BaseComponent} from './base.component';

@Component({
  selector: 'wah-input',
  template: `
    <ng-container *ngIf="column && row">
      <mat-form-field class="row col-md-12"
                      color="accent"
      >
        <input
                matInput
                [type]="type"
                [ngModel]="row[column.key]"
                (ngModelChange)="onInputChange(row, column, $event)">
      </mat-form-field>
    </ng-container>
  `
})
export class InputComponent extends BaseComponent {
  @Input() type: string;
  onInputChange = TableUtil.onInputChange;
}
