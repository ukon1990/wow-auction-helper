import {DatabaseUtil} from '../utils/database.util';
import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {LocaleQuery} from '../queries/locale.query';
import {PetHandler} from './pet.handler';
import {Pet} from '../models/pet';
import {ItemHandler} from './item.handler';
import {Item} from '../../../client/src/client/models/item/item';
import {RecipeHandler} from './recipe.handler';
import {Recipe, RecipeSpell} from '../models/crafting/recipe';
import {AuthHandler} from './auth.handler';
import {ItemLocale} from '../models/item/item-locale';
import {ItemUtil} from '../utils/item.util';

const PromiseThrottle: any = require('promise-throttle');

export class LocaleHandler {
  requestsPerSecondThreashold = 20;
  region = {
    eu: 'eu',
    us: 'us',
    kr: 'kr',
    tw: 'tw'
  };
  localeRegionMap = {
    // Europe
    en_GB: this.region.eu,
    de_DE: this.region.eu,
    es_ES: this.region.eu,
    fr_FR: this.region.eu,
    it_IT: this.region.eu,
    pl_PL: this.region.eu,
    pt_PT: this.region.eu,
    ru_RU: this.region.eu,
    // America
    en_US: this.region.us,
    es_MX: this.region.us,
    pt_BR: this.region.us,

    // Korea
    ko_KR: this.region.kr,
    // Taiwan
    zh_TW: this.region.tw
  };

  async findMissingLocales(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body),
      sql = LocaleQuery.findMissingLocales(body.table);
    console.log('findMissingLocales SQL:', sql);
    await AuthHandler.getToken();
    new DatabaseUtil()
      .query(sql)
      .then((rows: any[]) =>
        this.processMissingLocales(rows, body.table, event, callback))
      .catch(error => Response.error(callback, error, event));
  }

  private async processMissingLocales(rows: any[], table: string, event: APIGatewayEvent, callback: Callback) {
    const result = {
      update: {},
      insert: [] as ItemLocale[]
    };
    if (rows.length > 0) {
      const idName = rows[0].speciesId ? 'speciesId' : 'id';

      rows.forEach(row =>
        this.processMissingLocalesRow(row, result));

      await this.insertNewEntries(result.insert, table, idName);
      this.updateDatabase(result.update, table, idName);
    }

    // Add missing of locale to db and set lastModified on item to current_timestamp
    Response.send(result, callback);
  }

  private processMissingLocalesRow(row: ItemLocale, result) {
    if (row.en_GB === 'insert') {
      result.insert.push(row);
      return;
    }
    Object.keys(row)
      .forEach(column => {
        if (row[column] === null || row[column] === '404') {
          if (!result.update[column]) {
            result.update[column] = [];
          }
          result.update[column].push(row.id || row.speciesId);
        }
      });
  }

  private async insertNewEntries(inserts: ItemLocale[], table: string, idName: string) {
    const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: this.requestsPerSecondThreashold,
        promiseImplementation: Promise
      }),
      promises = [];

    inserts.forEach(row => {
      promises.push(
        promiseThrottle.add(() =>
          this.getInsertLocalePromises(row, table, idName)
        ));
    });

    return Promise.all(promises)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));
  }

  private updateDatabase(result: {}, table: string, idName: string) {
    Object.keys(result)
      .forEach(locale => {
        this.updateLocaleForIds(
          result[locale], table, idName, locale);
      });
  }

  private async updateLocaleForIds(ids: number[], table: string, idName: string, locale: string) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: this.requestsPerSecondThreashold,
      promiseImplementation: Promise
    });
    const itemIDs: any[] = [];

    ids.forEach((id: number) => {
      itemIDs.push(
        promiseThrottle.add(() =>
          this.getUpdateLocalePromises(id, table, idName, locale)));
    });

    await Promise.all(itemIDs)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));
  }

  private getUpdateLocalePromises(id: number, table: string, idName: string, locale: string): Promise<any> {
    switch (table) {
      case 'recipe':
        return new RecipeHandler().getProfessionForRecipe({
          spellID: id,
          name: 'not set'
        } as Recipe, locale, this.localeRegionMap[locale])
          .then((spell: RecipeSpell) =>
            this.updateLocaleTable(table, idName, id, locale, spell.name))
          .catch(console.error);
      default:
        return;
    }
  }


  private async getInsertLocalePromises(row: ItemLocale, table: string, idName: string): Promise<any> {
    const id = row.id || row.speciesId;
    for (const locale of Object.keys(row)) {
      if (locale !== 'id' && locale !== 'speciesId') {
        await this.setLocaleName(table, id, locale, row)
          .catch(console.error);

      }
    }

    return new Promise<any>(((resolve, reject) => {
      const sql = LocaleQuery
        .insert(`${table}_name_locale`, idName, row);
      console.log('updateLocaleTable SQL:', sql);
      new DatabaseUtil()
        .query(
          sql)
        .then(() => {
          this.updateTableTimestamp(table, id, idName, row.en_GB)
            .then(() => resolve())
            .catch(() => reject());
        })
        .catch(() => reject());
    }));
  }

  private setLocaleName(table: string, id, locale, row: ItemLocale) {
    switch (table) {
      case 'recipe':
        return new RecipeHandler().getProfessionForRecipe({
          spellID: id,
          name: 'not set'
        } as Recipe, locale, this.localeRegionMap[locale])
          .then((spell: RecipeSpell) =>
            row[locale] = spell.name ? spell.name : '404')
          .catch(() => row[locale] = '404');
      default:
        return;
    }
  }

  private updateLocaleTable(table: string, idName: string, id: number, locale, name) {
    if (!name) {
      console.error('Could not find by id:', id);
      return;
    }
    const sql = LocaleQuery
      .updateSingleLocale(`${table}_name_locale`, idName, id, locale, name);
    console.log('updateLocaleTable SQL:', sql);
    new DatabaseUtil()
      .query(
        sql)
      .then(() =>
        this.updateTableTimestamp(table, id, idName, name, locale))
      .catch(console.error);
  }

  private updateTableTimestamp(table: string, id: number, idName: string, name, locale?) {
    const sql = LocaleQuery.updateTimestamp(table + 's', id, idName);
    console.log('updateTableTimestamp SQL:', sql);
    return new DatabaseUtil()
      .query(sql)
      .then(() => console.log(`Successfully added ${id} - ${name} to ${locale}`))
      .catch(console.error);
  }
}
