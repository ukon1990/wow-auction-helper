import {DatabaseUtil} from '../utils/database.util';
import {PetQuery} from '../queries/pet.query';
import {LocaleUtil} from '../utils/locale.util';
import {PetUtil} from '../utils/pet.util';
import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {ApiResponse} from '../models/api-response.model';
import {QueryIntegrity} from '../queries/integrity.query';

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
                const friendlyPet: Pet = await QueryIntegrity.getVerified('pets', newPet);

                if (!friendlyPet) {
                  reject('The pet did not follow the data model - ' + newPet.speciesId);
                  return;
                }

                await new DatabaseUtil()
                  .query(PetQuery.insertInto(friendlyPet));

                await LocaleUtil.insertToDB(
                  'pet_name_locale',
                  'speciesId',
                  newPet.nameLocales);

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

  getAllRelevant(timestamp: string, locale: string = 'en_GB', db: DatabaseUtil = new DatabaseUtil()): Promise<ApiResponse<Pet>> {
    return new Promise<ApiResponse<Pet>>((resolve, reject) => {
      db.query(PetQuery.selectAllForTimestampWithLocale(locale, timestamp))
        .then((rows: Pet[]) => {
          console.log('Pets', rows.length);
          let ts: string = timestamp;
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
