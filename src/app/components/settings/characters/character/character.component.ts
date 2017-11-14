import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html'
})
export class CharacterComponent {
  @Input() index: number;
  @Input() character: Object;
}
