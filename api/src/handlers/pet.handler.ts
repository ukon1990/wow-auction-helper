import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {PetQuery} from '../queries/pet.query';
import {Response} from '../utils/response.util';
import {LocaleUtil} from '../utils/locale.util';
import { PetUtil } from '../utils/pet.util';
import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {ApiResponse} from '../models/api-response.model';

const request = require('request');

export class PetHandler {
  getById(id: number, locale: string = 'en_GB'): Promise<Pet> {
    return new Promise<Pet>((resolve, reject) => {
      this.getPetFromDBById(id, locale)
        .then((pet: Pet) => {
          if (pet) {
            resolve(pet);
          } else {
            PetUtil.getPet(id)
              .then(async (newPet: Pet) => {
                await new DatabaseUtil()
                  .query(PetQuery.insertInto(newPet));

                await LocaleUtil.setLocales(
                  newPet.speciesId,
                  'speciesId',
                  'pet_name_locale',
                  'pet/species')
                  .then(locales => {
                    if (locales[locale]) {
                      newPet.name = locales[locale];
                    }
                  })
                  .catch(e =>
                    reject(e));

                resolve(newPet);
              })
              .catch(reject);
          }
        });
    });
  }

  private async getPetFromDBById(id, locale) {
    return new Promise<Pet>(async (resolve, reject) => {
      new DatabaseUtil()
        .query(PetQuery.getPetBySpeciesId(id, locale))
        .then((rows: any[]) => {
          resolve(rows[0]);
        })
        .catch(error =>
          reject(error));
    });
  }

  update(id: number, locale: string = 'en_GB'): Promise<Pet> {
    return new Promise<Pet>((resolve, reject) => {
      PetUtil.getPet(id, locale)
        .then((newPet: Pet) => {
          new DatabaseUtil()
            .query(PetQuery.updatePet(newPet))
            .then(() => resolve(newPet))
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getAllRelevant(id: number, timestamp: number, locale: string = 'en_GB'): Promise<ApiResponse<Pet>> {
    return new Promise<ApiResponse<Pet>>((resolve, reject) => {
      new DatabaseUtil()
        .query(PetQuery.selectAllForTimestampWithLocale(locale, new Date(timestamp)))
        .then((rows: Pet[]) => {
          let ts = timestamp;
          if (rows.length > 0) {
            ts = rows[0].timestamp;
          }
          rows.forEach(row =>
            delete row.timestamp);
          resolve(new ApiResponse<Pet>(ts, rows, 'pets'));
        })
        .catch(reject);
    });
  }
}
