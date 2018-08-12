import { Request, Response } from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import * as RequestPromise from 'request-promise';
import { getLocale } from '../util/locales';
import { safeifyString } from './string.util';
import { BLIZZARD_API_KEY, DATABASE_CREDENTIALS } from './secrets';
import { ItemLocale } from '../models/item/item-locale';
const PromiseThrottle: any = require('promise-throttle');

export class PetUtil {

  public static getPet(
    id: number,
    res: Response,
    req: any) {
    try {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);
      connection.query('SELECT * from pets where speciesId = ' + req.params.id, function (err, rows, fields) {
        try {
          if (!err && rows.length > 0) {
            connection.end();
            res.send(rows[0]);
          } else {
            request.get(`https://eu.api.battle.net/wow/pet/species/${req.params.id}?locale=en_GB&apikey=${BLIZZARD_API_KEY}`, (err, re, body) => {
              const pet = PetUtil.reducePet(body),
                query = `
                  INSERT INTO pets (speciesId, petTypeId, creatureId,
                    name, icon, description, source)
                    VALUES (
                      ${ pet.speciesId},
                      ${ pet.petTypeId},
                      ${ pet.creatureId},
                      "${ safeifyString(pet.name)}",
                      "${ pet.icon}",
                      "${ safeifyString(pet.description)}",
                      "${ safeifyString(pet.source)}");`;

              res.send(pet);
              console.log(`${new Date().toString()} - Adding new pet to the DB: ${req.params.id} - SQL: ${query}`);

              connection.query(query,
                (err, rows, fields) => {
                  if (err) {
                    console.error(`Could not add the species with the id ${req.params.id}`, err.sqlMessage, query);
                  } else {
                    console.log(`Successfully added pet with speciesID ${req.params.id}`);
                    PetUtil.getPetLocale(pet.speciesId, req, res)
                      .then(p => console.log(`Added locale for pet ${pet.name}`))
                      .catch(e => console.error(`Could not get locale for ${pet.name}`, e));
                  }
                });
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

  public static patchPet(req: any, res: any) {
    request.get(`https://eu.api.battle.net/wow/pet/species/${req.params.id}?locale=en_GB&apikey=${BLIZZARD_API_KEY}`, (err, re, body) => {
      const pet = PetUtil.reducePet(body),
        query = `
        UPDATE pets
          SET
            petTypeId = ${ pet.petTypeId},
            creatureId = ${ pet.creatureId},
            name = "${ safeifyString(pet.name)}",
            icon = "${ pet.icon}",
            description = "${ safeifyString(pet.description)}",
            source = "${ safeifyString(pet.source)}"
          WHERE speciesId = ${ pet.speciesId};`;

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
      SELECT p.speciesId, petTypeId, creatureId, ${ getLocale(req)} as name, icon, description, source, timestamp
      FROM pets as p, pet_name_locale as l
      WHERE l.speciesId = p.speciesId
      AND timestamp > "${ req.body.timestamp }"
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
      connection.query('select speciesId from pets where speciesId not in (select speciesId from pet_name_locale);', async (err, rows, fields) => {
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
            .then(r => { })
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
    const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
      .map(locale => RequestPromise.get(`https://eu.api.battle.net/wow/pet/species/${speciesId}?locale=${locale}&apikey=${BLIZZARD_API_KEY}`, (r, e, b) => {
        try {
          pet[locale] = JSON.parse(b).name;
        } catch (e) {
          pet[locale] = '404';
        }
      })),
      usPromises = ['en_US', 'es_MX', 'pt_BR']
        .map(locale => RequestPromise.get(`https://us.api.battle.net/wow/pet/species/${speciesId}?locale=${locale}&apikey=${BLIZZARD_API_KEY}`, (r, e, b) => {
          try {
            pet[locale] = JSON.parse(b).name;
          } catch (e) {
            pet[locale] = '404';
          }
        }));

    await Promise.all(euPromises).then(r => { }).catch(e => { });

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

      connection.query(sql, (err, rows, fields) => {
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
}