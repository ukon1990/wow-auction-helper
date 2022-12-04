import {Component, Input} from '@angular/core';
import {ColumnDescription} from '@shared/models';
import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {BaseComponent} from './base.component';

@Component({
  selector: 'wah-row-actions',
  template: `
    <ng-container *ngFor="let action of column.actions">
      <button mat-icon-button
              [color]="action.color || 'primary'"
              [matTooltip]="action.tooltip"
              (click)="action.callback(row, getPageIndex())">
        <i [class]="action.icon"></i>
        {{ action.text }}
      </button>
    </ng-container>`
})
export class RowActionsComponent extends BaseComponent {
  @Input() pageEvent: PageEvent;
  @Input() index: number;

  getPageIndex(): number {
    return (this.pageEvent.pageIndex * this.pageEvent.pageSize) + this.index;
  }
}