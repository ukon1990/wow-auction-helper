import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';
import { startWith, map } from 'rxjs/operators';
import { ErrorReport } from '../utils/error-report.util';
import { Angulartics2 } from 'angulartics2';

@Injectable()
export class CharacterService {
  // ${API}character/${realm}/${character}?locale=${realm.locale}&apikey=${apiKey}&fields=professions,statistics,pets,petSlots,mounts

  constructor(private _http: HttpClient,
    private angulartics2: Angulartics2) { }

  getCharacter(character: string, realm: string, region?: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getBattleNetApi(
        `character/${
          realm
        }/${character}?fields=professions,statistics,pets,petSlots,mounts`, region))
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
        return {error: error};
      });
  }

  getCharacterMinimal(character: string, realm: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getBattleNetApi(
        `character/${
          realm
        }/${character}`))
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
        return {error: error};
      });
  }
}
