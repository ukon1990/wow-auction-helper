
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Character } from '../../../../models/character/character';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'wah-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent {
  @Input() index: number;
  @Input() character: Character;
  @Input() region: string;
  @Input() isSeller: boolean;
  @Output() remove: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();

  getAvatar(img: string): string {// thumbnail
    return `url(https://render-${
      this.getRegion()
    }.worldofwarcraft.com/character/${
      this.character.thumbnail
    })`;
  }

  getBackgroundImage() {
    if (this.character.thumbnail) {
      const url = `https://render-${ this.getRegion() }.worldofwarcraft.com/character/${
        this.character.thumbnail.replace('avatar', 'main')
        }`;
      return 'url(' + url + ')';
    }
    return '';
  }

  getRegion(): string {
    return SharedService.user.region ? SharedService.user.region : this.region;
  }
}
