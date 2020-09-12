import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'wah-close-btn',
  templateUrl: './close-btn.component.html',
  styleUrls: ['./close-btn.component.scss']
})
export class CloseBtnComponent {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
