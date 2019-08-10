import {Response} from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import {DATABASE_CREDENTIALS} from './secrets';
import {Endpoints} from '../endpoints';
import {PetQuery} from '../queries/pet.query';
import {Pet} from '../models/pet';
import {LocaleUtil} from './locale.util';

const PromiseThrottle: any = require('promise-throttle');

export class PetUtil {

  public static getPet(
    id: number,
    res: Response,
    req: any) {
    try {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);
      connection.query(PetQuery.getPetBySpeciesId(req),
        (error, rows) => {
          try {
            if (!error && rows.length > 0) {
              connection.end();
              res.send(rows[0]);
            } else {
              request.get(
                new Endpoints()
                  .getPath(`pet/species/${req.params.id}?locale=en_GB`), async (err, re, body) => {
                  const pet = PetUtil.reducePet(body),
                    query = PetQuery.insertInto(pet);

                  res.send(pet);
                  console.log(`${new Date().toString()} - Adding new pet to the DB: ${req.params.id} - SQL: ${query}`);

                  await connection.query(query,
                    (dbError) =>
                      this.handlePetInsertResponse(dbError, req, query, pet, res));
                  connection.end();
                });
            }
          } catch (e) {
            console.error(`Could not get the pet with the speciesID ${req.params.id}`, e);
            connection.end();
            res.json({});
          }
        });
    } catch (err) {
      res.send({});
      console.error(err);
    }
  }

  private static handlePetInsertResponse(dbError, req: any, query: string, pet, res: any) {
    if (dbError) {
      console.error(`Could not add the species with the id ${req.params.id}`, dbError.sqlMessage, query);
    } else {
      console.log(`Successfully added pet with speciesID ${req.params.id}`);
      LocaleUtil.setLocales(
        pet.speciesId,
        'speciesId',
        'pet_name_locale',
        'pet/species')
        .then(p =>
          console.log(`Added locale for pet ${pet.name}`))
        .catch(e =>
          console.error(`Could not get locale for ${pet.name}`, e));
    }
  }

  public static patchPet(req: any, res: any) {
    request.get(
      new Endpoints()
        .getPath(`pet/species/${req.params.id}?locale=en_GB`),
      (error, re, body) => {
        const pet = PetUtil.reducePet(body);

        res.json(pet);
        console.log(`${new Date().toString()} - Updating pet with speciesID: ${req.params.id} - SQL: ${PetQuery.updatePet(pet)}`);

        const connection = mysql.createConnection(DATABASE_CREDENTIALS);
        connection.query(PetQuery.updatePet(pet),
          (err) => {
            if (err) {
              console.error(`Could not update the pet with the speciesId ${req.params.id}`, err.sqlMessage);
            } else {
              console.log(`Successfully updated pet with speciesId ${req.params.id}`);
            }
          });
        connection.end();
      });
  }

  public static postPets(
    response: Response,
    req: any) {
    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    db.query(PetQuery.selectAllForTimestampWithLocale(req),
      (err, rows, fields) => {
        db.end();
        if (!err) {
          let timestamp;
          if (rows.length > 0) {
            timestamp = rows[0].timestamp;
          }
          rows.forEach(row =>
            delete row.timestamp);
          response.send({
            timestamp: timestamp,
            'pets': rows
          });
        } else {
          console.log('The following error occured while querying DB:', err);
        }
      });
  }

  public static reducePet(petBody: string): Pet {
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

  public static async setMissingLocales(req, res) {
    // Limit to 9 per second
    return new Promise((reso, rej) => {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);
      connection.query(`
        select speciesId
        from pets
        where speciesId not in (
          select speciesId
          from pet_name_locale);`, async (err, rows, fields) => {
        if (!err) {
          const promiseThrottle = new PromiseThrottle({
            requestsPerSecond: 1,
            promiseImplementation: Promise
          });

          const list = [];
          const speciesIDs = [];
          rows.forEach(row => {
            speciesIDs.push(
              promiseThrottle.add(() => {
                return new Promise((resolve, reject) => {
                  LocaleUtil.setLocales(
                    row.speciesId,
                    'speciesId',
                    'pet_name_locale',
                    'pet/species')
                    .then(r => {
                      list.push(r);
                      resolve(r);
                    })
                    .catch(e => {
                      console.error(e);
                      reject({});
                    });
                });
              }));
          });
          await Promise.all(speciesIDs)
            .then(r => {
            })
            .catch(e => console.error(e));
          reso(list);
        } else {
          rej({});
        }
      });
    });
  }
}
