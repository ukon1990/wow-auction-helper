import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '@shared/models';
import {BaseComponent} from './base.component';
import {currencyMap} from '../../../../data/currency.data';

@Component({
  selector: 'wah-item-currency',
  template: `
    <ng-container *ngIf="column && row">
    <span *ngIf="!row.currency; else itemCurrency">
                {{ row[column.key] | gold }}
              </span>
      <ng-template #itemCurrency>
        <span
                wahItemTooltip
                [item]="row"
                idName="currency"
                [linkType]="row.currencyType ? row.currencyType : 'item'"
        >
          <div class="float-left">
          <wah-icon *ngIf="idName"
                    class="float-left ml-1"
                    [size]="22"
                    [icon]="icon"
                    [id]="row.currency"></wah-icon>
              x
              {{ row[column.key] | number }}
          </div>
        </span>
      </ng-template>
    </ng-container>
  `,
})
export class ItemCurrencyComponent extends BaseComponent implements OnInit {
  icon: string;
  constructor() {
    super();
  }

  ngOnInit() {
    if (this.row.currencyType && this.row.currencyType === 'currency' && this.row.currency) {
      const currency = currencyMap.get(this.row.currency);
      if (currency) {

        this.icon = currency.icon;
      }
    }
  }
}