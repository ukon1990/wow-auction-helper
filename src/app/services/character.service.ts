import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';

@Injectable()
export class CharacterService {
  // ${API}character/${realm}/${character}?locale=${realm.locale}&apikey=${apiKey}&fields=professions,statistics,pets,petSlots,mounts

  constructor(private _http: HttpClient) { }

  getCharacter(character: string, realm: string, region?: string): Promise<any> {
    return this._http
      .get(Endpoints.getBattleNetApi(
        `character/${
          realm
        }/${character}?fields=professions,statistics,pets,petSlots,mounts`))
      .map(c => {
        console.log(c);
        return c;
      }, error => {
        console.error('Failed at downloading character', error);
        return {};
      }).toPromise();
  }
}
