import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'wah-close-btn',
  template: `
      <div class="action-icon">
          <ng-content></ng-content>

          <button
                  mat-raised-button
                  mat-dialog-close
                  class="btn btn-sm"
                  (click)="close.emit()"
                  color="accent"
                  matTooltip="Close">
              <i class="fas fa-times"></i>
          </button>
      </div>
  `
})
export class CloseBtnComponent {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
