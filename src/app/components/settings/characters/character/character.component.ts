
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Character } from '../../../../models/character/character';

@Component({
  selector: 'wah-character',
  templateUrl: './character.component.html'
})
export class CharacterComponent {
  @Input() index: number;
  @Input() character: Character;
  @Output() remove: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();

  getAvatar(img: string): string {// thumbnail
    return 'url(https://render-eu.worldofwarcraft.com/character/' + this.character.thumbnail + ')';
  }

  getBackgroundImage() {
    if (this.character.thumbnail) {
      const url = `https://render-eu.worldofwarcraft.com/character/${
        this.character.thumbnail.replace('avatar', 'main')
        }`;
      return 'url(' + url + ')';
    }
    return '';
  }
}
