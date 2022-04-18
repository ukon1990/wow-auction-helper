import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '@shared/models';
import {TableUtil} from '../../utils/table.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {BaseComponent} from './base.component';

@Component({
  selector: 'wah-input-gold',
  template: `
    <ng-container *ngIf="column && row">
      <mat-form-field class="row col-md-12"
                      color="accent"
      >
        <input
                matInput
                [ngModel]="row[column.key] | gold"
                (ngModelChange)="setNewInputGoldValue(row, column, $event)"
        />
      </mat-form-field>
    </ng-container>
  `
})
export class InputGoldComponent extends BaseComponent {
  private lastCharacterTyped: number;

  setNewInputGoldValue(row: any, column: ColumnDescription, newValue: any) {
    const interval = 500;
    this.lastCharacterTyped = +new Date();
    setTimeout(() => {
      if (+new Date() - this.lastCharacterTyped >= interval) {
        TableUtil.onInputChange(column, column, GoldPipe.toCopper(newValue));
        this.lastCharacterTyped = undefined;
      }
    }, interval);
  }
}