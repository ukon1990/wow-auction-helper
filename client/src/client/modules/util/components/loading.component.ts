import {Component, Input} from '@angular/core';

@Component({
  selector: 'wah-loading',
  template: `
    <mat-spinner color="accent">
      {{ message }}
    </mat-spinner>
  `
})
export class LoadingComponent {
  @Input() message = 'Loading';
}
