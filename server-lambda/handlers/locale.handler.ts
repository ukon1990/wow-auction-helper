import {DatabaseUtil} from '../utils/database.util';
import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {LocaleQuery} from '../queries/locale.query';
import {PetHandler} from './pet.handler';
import {Pet} from '../models/pet';
import {ItemHandler} from './item.handler';
import {Item} from '../models/item/item';
import {RecipeHandler} from './recipe.handler';
import {Recipe, RecipeSpell} from '../models/crafting/recipe';
import {AuthHandler} from './auth.handler';

const PromiseThrottle: any = require('promise-throttle');

export class LocaleHandler {
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
    const body = JSON.parse(event.body);
    await AuthHandler.getToken();
    new DatabaseUtil()
      .query(LocaleQuery.findMissingLocales(body.table))
      .then((rows: any[]) =>
        this.processMissingLocales(rows, body.table, event, callback))
      .catch(error => Response.error(callback, error, event));
  }

  private processMissingLocales(rows: any[], table: string, event: APIGatewayEvent, callback: Callback) {
    const result = {};
    if (rows.length > 0) {
      const idName = rows[0].speciesId ? 'speciesId' : 'id';
      Object.keys(rows[0])
        .forEach(column => {
          if (column !== idName) {
            result[column] = [];
          }
        });
      rows.forEach(row =>
        this.processMissingLocalesRow(row, result));

      this.updateDatabase(result, table, idName);
    }

    // Add missing of locale to db and set lastModified on item to current_timestamp
    Response.send(result, callback);
  }

  private processMissingLocalesRow(row, result) {
    Object.keys(row)
      .forEach(column => {
        if (row[column] === null || row[column] === '404') {
          result[column].push(row.id || row.speciesId);
        }
      });
  }

  private updateDatabase(result: {}, table: string, idName: string) {
    Object.keys(result)
      .forEach(locale => {
        this.addLocaleForIds(
          result[locale], table, idName, locale);
      });
    /*Promise.all(promises)
      .catch(error => console.error(error));*/
  }

  private async addLocaleForIds(ids: number[], table: string, idName: string, locale: string) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 20,
      promiseImplementation: Promise
    });
    const itemIDs: any[] = [];

    ids.forEach((id: number) => {
      itemIDs.push(
        promiseThrottle.add(() =>
          this.getAddLocalePromises(id, table, idName, locale)));
    });

    await Promise.all(itemIDs)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));
  }

  private getAddLocalePromises(id: number, table: string, idName: string, locale: string): Promise<any> {
    switch (table) {
      case 'pet':
        return new PetHandler().getPet(id, locale)
          .then((pet: Pet) =>
            this.updateLocaleTable(table, idName, id, locale, pet.name))
          .catch(console.error);
      case 'item':
        return new ItemHandler().getFromBlizzard(id, locale)
          .then((item: Item) =>
            this.updateLocaleTable(table, idName, id, locale, item.name))
          .catch(console.error);
      case 'recipe':
        return new RecipeHandler().getProfessionForRecipe({
          spellID: id,
          name: 'not set'
        } as Recipe)
          .then((spell: RecipeSpell) =>
            this.updateLocaleTable(table, idName, id, locale, spell.name))
          .catch(console.error);
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
    console.log('SQL:', sql);
    new DatabaseUtil()
      .query(
        sql)
      .then(() =>
        (this.updateTableTimestamp(table, id, idName, name, locale)))
      .catch(console.error);
  }

  private updateTableTimestamp(table: string, id: number, idName: string, name, locale) {
    const sql = LocaleQuery.updateTimestamp(table + 's', id, idName);
    console.log('SQL:', sql);
    new DatabaseUtil()
      .query(sql)
      .then(() => console.log(`Successfully added ${id} - ${name} to ${locale}`))
      .catch(console.error);
  }
}
