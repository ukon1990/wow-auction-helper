import {Character, UserPets} from './model';
import {AuthHandler} from '../handlers/auth.handler';
import {HttpClientUtil} from '../utils/http-client.util';
import {Endpoints} from '../utils/endpoints.util';
import {CharacterUtil} from './util';
import {CharacterGameDataMedia} from '../models/character/character-game-data.model';

export class CharacterService {
  static get(region: string, realm: string, name: string, locale: string): Promise<Character> {
    return new Promise<Character>(async (resolve, reject) => {
      const character: Character = new Character();

      await AuthHandler.getToken();
      await Promise.all([
        this.getAndSetCharacterProfile(character, realm, name, locale, region),
        this.getAndSetReputations(character, realm, name, locale, region),
        this.getAndSetThumbnail(character, realm, name, locale, region),
        this.getAndSetProfessions(character, realm, name, locale, region),
        this.getAndSetPets(character, realm, name, locale, region)
      ])
        .then(() =>
          resolve(character))
        .catch(error => {
          console.error({
            input: {
              region, realm, character, locale
            },
            error
          });
          reject({
            code: 401,
            message: 'The character was not found'
          });
        });
    });
  }


  private static getAndSetCharacterProfile(character: Character, realm: string, name: string, locale: string, region: string) {
    return new Promise((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region))
        .then(({headers, body}) => {
          CharacterUtil.setProfileBaseData(body, character);
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
          CharacterUtil.setReputationsBaseData(body, character);
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


  private static getAndSetProfessions(character: Character, realm: string, name: string, locale: string, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'professions'))
        .then(({body}) => {
          CharacterUtil.reduceProfessions(body, character);
          resolve(body);
        })
        .catch(reject);
    });
  }

  private static getAndSetThumbnail(character: Character, realm: string, name: string, locale: string, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'character-media'))
        .then(({body}) => {
          const media: CharacterGameDataMedia = body;

          character.media = {
          };

          if (media.assets) {
            media.assets.forEach(asset => {
              character.media[asset.key] = asset.value;
            });
          }

          resolve();
        })
        .catch(reject);
    });
  }

  private static getAndSetPets(character: Character, realm: string, name: string, locale: string, region: string) {
    return new Promise<UserPets>((resolve, reject) => {
      new HttpClientUtil().get(
        this.getUrl(realm, name, locale, region, 'collections/pets'))
        .then(({body}) => {
          CharacterUtil.reducePets(body.pets, body.unlocked_battle_pet_slots)
            .then(pets => {
              character.pets = pets;
              resolve(character.pets);
            })
            .catch(console.error);
        })
        .catch(reject);
    });
  }
}
