import {Character as APICharacter} from '../../../../../../api/src/character/model';
import {HttpErrorResponse} from '@angular/common/http';

export class Character extends APICharacter {
  downloading?: boolean;
  error?: HttpErrorResponse;
}

export class SettingsCharacter {
  lastModified: number;
  slug: string;
  name: string;
  faction: number;
}
