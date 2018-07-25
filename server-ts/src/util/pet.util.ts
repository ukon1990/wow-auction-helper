import { Request, Response } from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import * as RequestPromise from 'request-promise';
import { getLocale } from '../util/locales';
import { safeifyString } from './string.util';
import { BLIZZARD_API_KEY, DATABASE_CREDENTIALS } from './secrets';
const PromiseThrottle: any = require('promise-throttle');

export class PetUtil {

  public static getPet(
    id: number,
    response: Response,
    request: any) { }

  public static getPets(
    response: Response,
    request: any) {
    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    db.query(`
      SELECT p.speciesId, petTypeId, creatureId, ${ getLocale(request) } as name, icon, description, source 
      FROM pets as p, pet_name_locale as l 
      WHERE l.speciesId = p.speciesId;`, function (err, rows, fields) {
      db.end();
      if (!err) {
        response.send({
          'pets': rows
        });
      } else {
        console.log('The following error occured while querying DB:', err);
      }
    });
  }
}