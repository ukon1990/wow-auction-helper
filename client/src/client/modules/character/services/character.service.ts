import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SharedService} from '../../../services/shared.service';
import {Endpoints} from '../../../services/endpoints';
import {ErrorOptions, ErrorReport} from '../../../utils/error-report.util';
import {UserUtil} from '../../../utils/user/user.util';
import {Character} from '../models/character.model';

@Injectable()
export class CharacterService {
  events: EventEmitter<any> = new EventEmitter();

  constructor(private _http: HttpClient) { }

  getCharacter(character: string, realm: string, region?: string): Promise<Character> {
    SharedService.downloading.characterData = true;
    return new Promise<Character>((resolve, reject) => {
      this._http
        .post(Endpoints.getLambdaUrl(`character`),
          {
            region: region ? region : SharedService.user.region,
            realm: realm,
            name: character,
            locale: Endpoints.getRealm(UserUtil.slugifyString(realm)).locale,
            withFields: true
          })
        .toPromise()
        .then((char: Character) => {
          SharedService.downloading.characterData = false;
          if (char['error']) {
            console.log('Res', char);
            reject(char);
          } else {
            this.emitChanges(char);
            resolve(char);
          }
        }).catch(error => {
        SharedService.downloading.characterData = false;
        console.log('Error', error);
        ErrorReport.sendHttpError(
          error,
          new ErrorOptions(
            true,
            `${
              character
            } could not be found on the realm ${
              realm
            }.`));
        reject(error);
      });
    });
  }

  getCharacterMinimal(character: string, realm: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .post(Endpoints.getLambdaUrl(`character`),
        {
          region: SharedService.user.region,
          realm: realm,
          name: character,
          locale: Endpoints.getRealm(UserUtil.slugifyString(realm)).locale,
          withFields: false
        })
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        this.emitChanges(c);
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error);
        return {error: error};
      });
  }

  private emitChanges(c: Object) {
    setTimeout(() =>
      this.events.emit(c));
  }
}
