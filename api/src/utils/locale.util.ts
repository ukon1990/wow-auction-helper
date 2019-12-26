import * as RequestPromise from 'request-promise';
import {ItemLocale} from '../models/item/item-locale';
import {LocaleQuery} from '../queries/locale.query';
import {DatabaseUtil} from './database.util';
import {Endpoints} from './endpoints.util';
import {BLIZZARD} from '../secrets';
import {AuthHandler} from '../handlers/auth.handler';

/**
 * Sets the locale for the request, if no locale is defined, it will either use en_GB or the users browser locale if possible
 * @param {*} request
 */

export const getLocale = (locale: string) => {
  return locale || 'en_GB';
};

export class LocaleUtil {
  private static locales = {
    eu: ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU'],
    us: ['en_US', 'es_MX', 'pt_BR'],
    kr: ['ko_KR'],
    tw: ['zh_TW']
  };

  /* istanbul ignore next */
  public static async setLocales(id: any, idName: string, tableName: string, apiPath: string): Promise<any> {
    const data: ItemLocale = new ItemLocale(id);

    if (BLIZZARD.ACCESS_TOKEN === '') {
      await AuthHandler.getToken();
    }

    await this.fetchLocales(id, data, apiPath);
    console.log('data after for each', data);

    this.insertToDB(tableName, idName, data);
    return data;
  }

  /* istanbul ignore next */
  public static async insertToDB(tableName: string, idName: string, data: ItemLocale) {
    console.log('Query', LocaleQuery.insert(tableName, idName, data));
    return await new DatabaseUtil()
      .query(LocaleQuery.insert(tableName, idName, data))
      .then(result =>
        console.log(`Locale added to db for ${data.en_GB}`))
      .catch(error =>
        console.error(`Locale not added to db for ${data.en_GB}`, error));
  }

  private static async fetchLocales(id: any, data: ItemLocale, apiPath: string) {
    return Promise.all(
      this.parseRegions(
        id,
        data,
        apiPath)
    );
  }

  /* istanbul ignore next */
  private static getLocalePromises(array: string[], id: number, locales: ItemLocale, region: string, apiPath: string) {
    return array
      .map(locale =>
        LocaleUtil.getRequestPromise(apiPath, id, locale, region, locales));
  }

  /* istanbul ignore next */
  private static getRequestPromise(apiPath: string, id: number, locale, region: string, locales: ItemLocale) {
    return RequestPromise.get(
      new Endpoints()
        .getPath(`${apiPath}/${id}?locale=${locale}`, region), (r, e, b) => {
        try {
          locales[locale] = JSON.parse(b).name;
        } catch (e) {
          locales[locale] = '404';
        }
      });
  }

  /* istanbul ignore next */
  private static parseRegions(id: any, data: ItemLocale, apiPath: string) {
    return Object.keys(LocaleUtil.locales).map(region =>
      Promise.all(
        this.getLocalePromises(
          LocaleUtil.locales[region],
          id,
          data,
          region,
          apiPath)
      ));
  }

  /* istanbul ignore next */
  public static async addLocale(id: any, locale: string, region: string, apiPath: string, idName: string, tableName: string) {
    return new Promise(async (resolve) => {
      const localeResult: ItemLocale = new ItemLocale(id);

      await LocaleUtil.getRequestPromise(apiPath, id, locale, region, localeResult);
      await this.updateLocale(id, tableName, idName, locale, localeResult[locale]);

      resolve({
        id: id,
        name: localeResult
      });
    });
  }

  /* istanbul ignore next */
  private static checkForMissingLocales(id: any, data: ItemLocale, apiPath: string) {
    return Object.keys(LocaleUtil.locales).map(region =>
      Promise.all(
        this.getLocalePromises(
          LocaleUtil.locales[region],
          id,
          data,
          region,
          apiPath)
      ));
  }

  /* istanbul ignore next */
  private static updateLocale(id: any, tableName: string, idName: string, locale: string, data: string) {
    return new Promise((resolve) => {
      new DatabaseUtil()
        .query(LocaleQuery.updateSingleLocale(tableName, idName, id, locale, data))
        .then(() =>
          console.log(`Locale added to db for ${locale}@${data}`))
        .catch(error =>
          console.error(`Locale not added to db for ${locale}@${data}`, error))
        .finally(() => resolve());
    });
  }
}
