import {Endpoints} from './endpoints.util';
import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {HttpClientUtil} from './http-client.util';
import {AuthHandler} from '../handlers/auth.handler';
import {GameMediaUtil} from './game-media.util';

export class PetUtil {
  static async getPet(id: number, locale: string = 'en_GB', region: string = 'eu'): Promise<Pet> {
    await AuthHandler.getToken();
    const url = new Endpoints()
      .getPath(`pet/${id}`, region, true);
    return new Promise<Pet>((resolve, reject) => {
      new HttpClientUtil().get(url)
        .then(({body}) =>
          resolve(this.reducePet(body, locale, region)))
        .catch(reject);
    });
  }

  static reducePet(petRaw: any, locale: string = 'en_GB', region: string = 'eu'): Pet {
    petRaw.name.id = petRaw.id;
    return {
      speciesId: petRaw.id,
      petTypeId: petRaw.petTypeId,
      creatureId: petRaw.creatureId,
      name: petRaw.name[locale],
      nameLocales: petRaw.name,
      canBattle: petRaw.is_battlepet,
      isCapturable: petRaw.is_capturable,
      isTradable: petRaw.is_tradable,
      icon: GameMediaUtil.getRawIconFileName(petRaw.icon, region),
      description: petRaw.description,
      source: petRaw.source.type
    } as Pet;
  }
}
