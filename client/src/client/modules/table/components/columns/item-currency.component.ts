import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '../../models/column-description';
import {BaseComponent} from './base.component';

@Component({
  selector: 'wah-item-currency',
  template: `
    <ng-container *ngIf="column && row">
    <span *ngIf="!row.currency; else itemCurrency">
                {{ row[column.key] | gold }}
              </span>
      <ng-template #itemCurrency>
        <a rel="domain={{ locale }},item={{ row.currency }}">
          <div class="float-left">
            {{ row[column.key] | number }} x
          </div>
          <wah-icon *ngIf="idName"
                    class="float-left ml-1"
                    [size]="22"
                    [id]="row.currency"></wah-icon>
        </a>
      </ng-template>
    </ng-container>
  `,
})
export class ItemCurrencyComponent extends BaseComponent {
}
