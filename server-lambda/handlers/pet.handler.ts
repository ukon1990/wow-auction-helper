import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {PetQuery} from '../queries/pet.query';
import {Response} from '../utils/response.util';
import {Pet} from '../../server/src/models/pet';
import {LocaleUtil} from '../utils/locale.util';

const request = require('request');

export class PetHandler {
  getById(event: APIGatewayEvent, callback: Callback) {
    const locale = JSON.parse(event.body).locale;
    const id = +event.pathParameters.id;
    this.getPetFromDBById(id, locale)
      .then((pet: Pet) => {
        if (pet) {
          Response.send(pet, callback);
        } else {
          this.getPet(id)
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
                  console.error(`Could not get locale for ${newPet.name} (${newPet.speciesId})`, e));

              Response.send(newPet, callback);
            })
            .catch(error =>
              Response.error(callback, error, event));
        }
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

  update(event: APIGatewayEvent, callback: Callback) {
    const locale = JSON.parse(event.body).locale;
    const id = +event.pathParameters.id;
    this.getPet(id)
      .then((newPet: Pet) => {
        new DatabaseUtil()
          .query(PetQuery.updatePet(newPet))
          .then(() =>
            Response.send(newPet, callback))
          .catch(error => Response.error(callback, error, event));
      })
      .catch(error =>
        Response.error(callback, error, event));

  }

  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body);
    new DatabaseUtil()
      .query(PetQuery.selectAllForTimestampWithLocale(body.locale, body.timestamp))
      .then((rows: any[]) => {
        let timestamp = new Date().toJSON();
        if (rows.length > 0) {
          timestamp = rows[0].timestamp;
        }
        rows.forEach(row =>
          delete row.timestamp);
        Response.send({
          timestamp: timestamp,
          'pets': rows
        }, callback);
      })
      .catch(error =>
        Response.error(callback, error, event));
  }

  reducePet(petBody: string): Pet {
    const petRaw = JSON.parse(petBody);
    return {
      speciesId: petRaw.speciesId,
      petTypeId: petRaw.petTypeId,
      creatureId: petRaw.creatureId,
      name: petRaw.name,
      canBattle: petRaw.canBattle,
      icon: petRaw.icon,
      description: petRaw.description,
      source: petRaw.source
    };
  }

  private getPet(id: number): Promise<Pet> {
    return new Promise<Pet>((resolve, reject) => {
      request.get(`pet/species/${id}?locale=en_GB`, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(this.reducePet(body));
      });
    });
  }
}
