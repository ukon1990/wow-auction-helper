import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {Character} from '../../models/character.model';

@Component({
  selector: 'wah-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent {
  @Input() index: number;
  @Input() character: Character;
  @Input() minimal: boolean;
  @Input() disallowDelete: boolean;
  @Input() region: string;
  @Input() isSeller: boolean;
  @Output() remove: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();

  getAvatar(): string {
    return `url(${this.character.media.avatarUrl})`;
  }

  getBackgroundImage() {
    if (this.character.media) {
      return 'url(' + this.character.media.renderUrl + ')';
    }
    return '';
  }

  getRegion(): string {
    return SharedService.user.region ? SharedService.user.region : this.region;
  }
}
