import {Response} from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import * as RequestPromise from 'request-promise';
import {getLocale} from '../util/locales';
import {safeifyString} from './string.util';
import {DATABASE_CREDENTIALS} from './secrets';
import {ItemLocale} from '../models/item/item-locale';
import {Endpoints} from '../endpoints';

const PromiseThrottle: any = require('promise-throttle');

export class PetUtil {

  public static getPet(
    id: number,
    res: Response,
    req: any) {
    try {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);
      connection.query(`
            SELECT *
            FROM pets
            WHERE speciesId = ${ req.params.id }`,
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
                    query = `
                  INSERT INTO pets (speciesId, petTypeId, creatureId,
                    name, icon, description, source)
                    VALUES (
                      ${pet.speciesId},
                      ${pet.petTypeId},
                      ${pet.creatureId},
                      "${safeifyString(pet.name)}",
                      "${pet.icon}",
                      "${safeifyString(pet.description)}",
                      "${safeifyString(pet.source)}");`;

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

  private static handlePetInsertResponse(dbError, req: any, query: string, pet, res: e.Response) {
    if (dbError) {
      console.error(`Could not add the species with the id ${req.params.id}`, dbError.sqlMessage, query);
    } else {
      console.log(`Successfully added pet with speciesID ${req.params.id}`);
      PetUtil.getPetLocale(pet.speciesId, req, res)
        .then(p => console.log(`Added locale for pet ${pet.name}`))
        .catch(e => console.error(`Could not get locale for ${pet.name}`, e));
    }
  }

  public static patchPet(req: any, res: any) {
    request.get(
      new Endpoints()
        .getPath(`pet/species/${req.params.id}?locale=en_GB`),
      (error, re, body) => {
        const pet = PetUtil.reducePet(body),
          query = `
        UPDATE pets
          SET
            petTypeId = ${pet.petTypeId},
            creatureId = ${pet.creatureId},
            name = "${safeifyString(pet.name)}",
            icon = "${pet.icon}",
            description = "${safeifyString(pet.description)}",
            source = "${safeifyString(pet.source)}"
          WHERE speciesId = ${pet.speciesId};`;

        res.json(pet);
        console.log(`${new Date().toString()} - Updating pet with speciesID: ${req.params.id} - SQL: ${query}`);

        const connection = mysql.createConnection(DATABASE_CREDENTIALS);
        connection.query(query,
          (err, rows, fields) => {
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
    db.query(`
      SELECT p.speciesId, petTypeId, creatureId, ${getLocale(req)} as name, icon, description, source, timestamp
      FROM pets as p, pet_name_locale as l
      WHERE l.speciesId = p.speciesId
      AND timestamp > "${req.body.timestamp}"
      ORDER BY timestamp desc;`,
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

  public static reducePet(pet) {
    pet = JSON.parse(pet);
    return {
      speciesId: pet.speciesId,
      petTypeId: pet.petTypeId,
      creatureId: pet.creatureId,
      name: pet.name,
      canBattle: pet.canBattle,
      icon: pet.icon,
      description: pet.description,
      source: pet.source
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
                  PetUtil.getPetLocale(row.speciesId, req, res)
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

  public static async getPetLocale(speciesId: number, req: any, res: any) {
    const pet: ItemLocale = new ItemLocale(speciesId);
    const euPromises = this.getLocalePromises(
      ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU'],
      speciesId,
      pet,
      'eu'),
      usPromises = this.getLocalePromises(
        ['en_US', 'es_MX', 'pt_BR'],
        speciesId,
        pet,
        'us');

    await Promise.all(euPromises).then(r => {
    }).catch(e => {
    });

    await Promise.all(usPromises).then(r => {
    }).catch(e => {
    });

    try {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS),
        sql = `INSERT INTO pet_name_locale
        (speciesId,
          en_GB,
          en_US,
          de_DE,
          es_ES,
          es_MX,
          fr_FR,
          it_IT,
          pl_PL,
          pt_PT,
          pt_BR,
          ru_RU)
        VALUES
        (${pet['id']},
          "${safeifyString(pet['en_GB'])}",
          "${safeifyString(pet['en_US'])}",
          "${safeifyString(pet['de_DE'])}",
          "${safeifyString(pet['es_ES'])}",
          "${safeifyString(pet['es_MX'])}",
          "${safeifyString(pet['fr_FR'])}",
          "${safeifyString(pet['it_IT'])}",
          "${safeifyString(pet['pl_PL'])}",
          "${safeifyString(pet['pt_PT'])}",
          "${safeifyString(pet['pt_BR'])}",
          "${safeifyString(pet['ru_RU'])}");`;

      connection.query(sql, (err) => {
        if (!err) {
          console.log(`Locale added to db for ${pet.en_GB}`);
        } else {
          console.error(`Locale not added to db for ${pet.en_GB}`, err);
        }
        connection.end();
      });
      //
    } catch (e) {
      //
    }
    return pet;
  }

  private static getLocalePromises(array: string[], speciesId: number, pet: ItemLocale, region: string) {
    return array
      .map(locale => RequestPromise.get(
        new Endpoints()
          .getPath(`pet/species/${speciesId}?locale=${locale}`, region), (r, e, b) => {
          try {
            pet[locale] = JSON.parse(b).name;
          } catch (e) {
            pet[locale] = '404';
          }
        }));
  }
}
