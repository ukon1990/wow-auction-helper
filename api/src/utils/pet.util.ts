import {Endpoints} from './endpoints.util';
import {Pet} from '../shared/models';
import {HttpClientUtil} from './http-client.util';
import {AuthHandler} from '../functions/handlers/auth.handler';
import {GameMediaUtil} from './game-media.util';

export class PetUtil {
  static async getPet(id: number, locale: string = 'en_GB', region: string = 'eu'): Promise<Pet> {
    await AuthHandler.getToken();
    const url = new Endpoints()
      .getPath(`pet/${id}`, region);
    return new Promise<Pet>((resolve, reject) => {
      new HttpClientUtil().get(url)
        .then(({body}) =>
          resolve(this.reducePet(body, locale, region)))
        .catch(reject);
    });
  }

  static reducePet(petRaw: any, locale: string = 'en_GB', region: string = 'eu'): Pet {
    petRaw.name.id = petRaw.id;
    petRaw.name.pt_PT = petRaw.name.pt_BR;
    petRaw.name.pl_PL = petRaw.name.en_GB;
    return {
      speciesId: petRaw.id,
      petTypeId: -1, // TODO: Re-map typeId! petRaw.battle_pet_type.TYPE,
      creatureId: petRaw.creature.id,
      name: petRaw.name[locale],
      nameLocales: {
        speciesId: petRaw.id,
        ...petRaw.name
      },
      canBattle: petRaw.is_battlepet,
      isCapturable: petRaw.is_capturable,
      isTradable: petRaw.is_tradable,
      icon: GameMediaUtil.getRawIconFileName(petRaw.icon, region),
      description: petRaw.description['en_GB'],
      source: petRaw.source.type
    } as Pet;
  }
}