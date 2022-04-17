import {HttpErrorResponse} from '@angular/common/http';
import {Character as APICharacter} from '@shared/models';

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