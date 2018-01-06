import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';
import 'rxjs/add/operator/map';

@Injectable()
export class CharacterService {
  // ${API}character/${realm}/${character}?locale=${realm.locale}&apikey=${apiKey}&fields=professions,statistics,pets,petSlots,mounts

  constructor(private _http: HttpClient) { }

  getCharacter(character: string, realm: string, region?: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getBattleNetApi(
        `character/${
          realm
        }/${character}?fields=professions,statistics,pets,petSlots,mounts`, region))
      .map(c => {
        SharedService.downloading.characterData = false;
        return c;
      }, error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        return {};
      }).toPromise();
  }

  getCharacterMinimal(character: string, realm: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getBattleNetApi(
        `character/${
          realm
        }/${character}`))
      .map(c => {
        SharedService.downloading.characterData = false;
        return c;
      }, error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        return {};
      }).toPromise();
  }
}
