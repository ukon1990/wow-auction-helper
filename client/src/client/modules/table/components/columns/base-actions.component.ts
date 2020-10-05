import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '../../models/column-description';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faEye} from '@fortawesome/free-solid-svg-icons';
import {CustomPrices} from '../../../crafting/models/custom-price';
import {CustomProcUtil} from '../../../crafting/utils/custom-proc.util';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'wah-base-actions',
  template: `
    <!--
      <button *ngIf="getItemID(d)"
            mat-icon-button
            color="accent"
            (click)="setSelectedItem(d)"
            matTooltip="View item details">
      <fa-icon [icon]="faEye"></fa-icon>
      </button>
    -->

    <ng-container *ngFor="let action of column.actions">
                <span [ngSwitch]="action">

                  <button *ngSwitchCase="'remove-from-list'"
                          mat-icon-button
                          color="warn"
                          matTooltip="Removes this item from the list" (click)="removeFromList(index)">
                    <fa-icon [icon]="faTrashAlt"></fa-icon>
                  </button>

                  <button *ngSwitchCase="'custom-price-delete'"
                          color="warn"
                          mat-icon-button
                          (click)="removeCustomPrice()"
                          matTooltip="Remove from custom price list">
                    <fa-icon [icon]="faTrashAlt"></fa-icon>
                  </button>

                  <button *ngSwitchCase="'custom-procs-delete'"
                          mat-icon-button (click)="removeCustomProc()"
                          color="warn"
                          matTooltip="Remove from custom procs list">
                    <fa-icon [icon]="faTrashAlt"></fa-icon>
                  </button>
                </span>
    </ng-container>
  `
})
export class BaseActionsComponent {
  @Input() column: ColumnDescription;
  @Input() row: any;
  @Input() rows: any[];
  @Input() index: number;
  @Input() pageEvent: PageEvent;

  faTrashAlt = faTrashAlt;
  faEye = faEye;

  removeFromList(i): void {
    const pagignationIndex = this.pageEvent.pageIndex * this.pageEvent.pageSize;
    this.rows.splice(pagignationIndex + i, 1);
  }

  removeCustomPrice(): void {
    return CustomPrices.remove(this.row, this.index);
  }

  removeCustomProc(): void {
    return CustomProcUtil.remove(this.row, this.index);
  }
}
