import {Character} from '../../../client/src/client/modules/character/models/character.model';
import {CharacterGameData, CharacterGameDataMedia, Faction} from '../models/character/character-game-data.model';
import {HttpClientUtil} from './http-client.util';
import {Endpoints} from './endpoints.util';
import {CharacterReputationsGameData} from '../models/character/character-reputations-game-data.model';

export class CharacterUtil {

  static get(region: string, realm: string, name: string, locale: string) {
    return new Promise((resolve, reject) => {
      const character = new Character();
      Promise.all([
        this.getAndSetCharacterProfile(character, realm, name, locale, region),
        this.getAndSetReputations(character, realm, name, locale, region),
        this.getAndSetThumbnail(character, realm, name, locale, region),
        // this.getAndSetProfessions(character, realm, name, locale, region)
      ])
        .then(() =>
          resolve(character))
        .catch(reject);
    });
  }

  private static getAndSetCharacterProfile(character: Character, realm: string, name: string, locale: string, region: string) {
    return new Promise((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region))
        .then(({headers, body}) => {
          this.setProfileBaseData(body, character);
          resolve(body);
        })
        .catch(error => {
          console.error('could not get character', error);
          reject(error);
        });
    });
  }

  private static getAndSetReputations(character: Character, realm: string, name: string, locale: string, region: string) {
    return new Promise((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'reputations'))
        .then(({headers, body}) => {
          this.setReputationsBaseData(body, character);
          resolve(body);
        })
        .catch(error => {
          console.error('could not get character', error);
          reject(error);
        });
    });
  }

  private static getUrl(realm: string, name: string, locale: string, region: string, subPath?: string) {
    return new Endpoints()
      .getPath(
        `character/${
          encodeURIComponent(realm)
        }/${
          encodeURIComponent(name.toLowerCase())
        }${
          subPath ? '/' + subPath : ''
        }?locale=${
          locale
        }`,
        region, 'profile');
  }

  static setProfileBaseData(gameData: CharacterGameData, character: Character): void {
    character.name = gameData.name;
    character.faction = this.getFaction(gameData.faction);
    character.realm = gameData.realm.slug;
    character.guild = gameData.guild.name;
    character.level = gameData.level;
    character.lastModified = gameData.last_login_timestamp;
  }

  private static getFaction(faction: Faction): number {
    return faction.type === 'HORDE' ? 1 : 0;
  }

  private static setReputationsBaseData(body: CharacterReputationsGameData, character: Character) {
    body.reputations.forEach(reputation => {
      delete reputation.faction.key;
    });
    character.reputations = body.reputations;
  }

  private static getAndSetProfessions(character: Character, realm: string, name: string, locale: string, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'professions'))
        .then(({body}) => {
          console.log('Profession result:', body);
          resolve();
        })
        .catch(reject);
    });
  }

  private static getAndSetThumbnail(character: Character, realm: string, name: string, locale: string, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'character-media'))
        .then(({body}) => {
          character.media = {
            renderUrl: body.render_url,
            avatarUrl: body.avatar_url,
            bustUrl: body.bust_url
          };
          resolve();
        })
        .catch(reject);
    });
  }
}
