import {ItemLocale} from '../models/item/item-locale';
import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from './secrets';
import {LocaleQuery} from '../queries/locale.query';
import * as RequestPromise from 'request-promise';
import {Endpoints} from '../endpoints';

/**
 * Sets the locale for the request, if no locale is defined, it will either use en_GB or the users browser locale if possible
 * @param {*} request
 */

export const getLocale = (request: any) => {
  // req.headers['accept-language']
  if (request.query && request.query.locale) {
    return request.query.locale;
  }
  return 'en_GB';
};

export class LocaleUtil {
  private static locales = {
    eu: ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU'],
    us: ['en_US', 'es_MX', 'pt_BR']
  };

  public static async setLocales(id: any, idName: string, tableName: string, apiPath: string): Promise<any> {
    const pet: ItemLocale = new ItemLocale(id);
    const euPromises = this.getLocalePromises(
      ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU'],
      id,
      pet,
      'eu',
      apiPath),
      usPromises = this.getLocalePromises(
        ['en_US', 'es_MX', 'pt_BR'],
        id,
        pet,
        'us',
        apiPath);

    await Promise.all(euPromises).then(r => {
    }).catch(e => {
    });

    await Promise.all(usPromises).then(r => {
    }).catch(e => {
    });

    try {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);

      connection.query(LocaleQuery.insert(tableName, idName, pet),
        (err) => {
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

  private static getLocalePromises(array: string[], id: number, locales: ItemLocale, region: string, apiPath: string) {
    return array
      .map(locale => RequestPromise.get(
        new Endpoints()
          .getPath(`${ apiPath }/${id}?locale=${locale}`, region), (r, e, b) => {
          try {
            locales[locale] = JSON.parse(b).name;
          } catch (e) {
            locales[locale] = '404';
          }
        }));
  }
}
