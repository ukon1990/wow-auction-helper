import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Endpoints } from './endpoints';
import { startWith, map } from 'rxjs/operators';
import { ErrorReport } from '../utils/error-report.util';
import {User} from '../models/user/user';

@Injectable()
export class CharacterService {

  constructor(private _http: HttpClient) { }

  getCharacter(character: string, realm: string, region?: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getUrl(
        `character/${
          region
          }/${
          realm
        }/${character}?withFields=true&locale=${
          Endpoints.getRealm(User.slugifyString(realm)).locale}`))
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        return {error: error};
      });
  }

  getCharacterMinimal(character: string, realm: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .get(Endpoints.getUrl(
        `character/${
          SharedService.user.region
          }/${
          realm
          }/${character}?locale=${
          Endpoints.getRealm(User.slugifyString(realm)).locale}`))
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error);
        return {error: error};
      });
  }
}
