import { Error } from './../utils/error';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DB_TABLES, API_KEY, db, lists } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';
import { User } from 'app/models/user';

@Injectable()
export class CharacterService {
  public static user: User;

  constructor(private http: HttpClient) {}

  getCharacters() {
    return this.http
      .get(`http://wah.jonaskf.net/GetCharacterProfession.php?character=${
      localStorage.crafters
      }&realm=${
      CharacterService.user.realm
      }&region=${
        CharacterService.user.region
      }`)
      .map(r => {
        console.log(r);
        return r;
      }, error => Error.handle('Failed at downloading character', error));
  }

  getCharacter(character: string, realm: string, region?: string): Promise<any> {
    return this.http
      .get(`https://${
      region ? region : CharacterService.user.region
      }.api.battle.net/wow/character/${
      realm
      }/${character}?fields=professions&locale=en_US&apikey=${
      API_KEY
      }`)
      .map(c => {
        console.log(c);
        return c;
      }, error => {
        Error.handle('Failed at downloading character', error);
        return {};
      }).toPromise();
  }

}
