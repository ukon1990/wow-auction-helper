import {ItemLocale} from '../models/item/item-locale';
import {HttpClientUtil} from './http-client.util';
import {QueryIntegrity} from '../queries/integrity.query';
import {QueryUtil} from './query.util';
import {LocaleUtil} from './locale.util';
import {DatabaseUtil} from './database.util';
import {TextUtil} from '@ukon1990/js-utilities';

const PromiseThrottle: any = require('promise-throttle');

class ZoneLanguage {
  locales: string[];
  type: string;
  key: string;
  territory: string;
}

export class Zone {
  id: number;
  name: ItemLocale = new ItemLocale();
  patch?: string;
  typeId: number;
  parentId?: number;
  parentName?: string;
  territoryId: number;
  minLevel?: number;
  maxLevel?: number;

  constructor(id: number) {
    this.id = id;
  }

  setData?(body: { name: string, tooltip: string }, language: ZoneLanguage): void {
    language.locales.forEach(locale => {
      this.setName(body.name, locale);
    });

    if (language.key === 'en') {
      this.setTooltipData(body.tooltip);
    }
  }

  private setName?(name: string, locale = 'en_GB'): void {
    this.name[locale] = name;
  }

  private setTooltipData?(tooltip: string): void {
    this.setTerritoryId(tooltip);
    this.setTypeId(tooltip);
    this.setLevel(tooltip);
    this.setParentName(tooltip);
  }

  private setTerritoryId?(tooltip: string): void {
    const territoryRegex = new RegExp('Territory: [\\w ]{1,128}', 'gm'),
      territory = territoryRegex.exec(tooltip)[0].replace('Territory: ', '');
    switch (territory) {
      case 'Alliance':
        this.territoryId = 0;
        break;
      case 'Horde':
        this.territoryId = 1;
        break;
      case 'Contested':
        this.territoryId = 2;
        break;
      case 'World PvP':
        this.territoryId = 3;
        break;
      case 'Sanctuary':
        this.territoryId = 4;
        break;
      case 'PvP':
        this.territoryId = 5;
        break;
      default:
        console.log('Territory type not accounted for: ' + territory);
        this.territoryId = -1;
        break;
    }
  }

  private setTypeId?(tooltip: string): void {
    const typeRegex = new RegExp('Type: [\\w ]{1,128}', 'gm'),
      type = typeRegex.exec(tooltip)[0].replace('Type: ', '');
    switch (type) {
      case 'Zone':
        this.typeId = 0;
        break;
      case 'City':
        this.typeId = 1;
        break;
      case 'Dungeon':
        this.typeId = 2;
        break;
      case 'Raid':
        this.typeId = 3;
        break;
      case 'Scenario':
        this.typeId = 4;
        break;
      case 'Artifact Acquisition':
        this.typeId = 5;
        break;
      case 'Battleground':
        this.typeId = 6;
        break;
      default:
        console.log('Type was not accounted for: ', type);
        this.typeId = -1;
        break;
    }
  }

  private setLevel?(tooltip: string): void {
    const levelRegex = new RegExp(/Level [\d]{1,3}(-[\d]{1,3}){0,2}/gm),
      levelRange = levelRegex.exec(tooltip);

    if (levelRange) {
      const splitRange = levelRange[0].replace('Level ', '').split('-');
      this.minLevel = +splitRange[0];
      this.maxLevel = +splitRange[1] || undefined;
    }
  }

  private setParentName?(tooltip: string) {
    const locationRegex = new RegExp(/Location: [\w'\- ]{1,128}/gm),
      location = locationRegex.exec(tooltip);
    if (location) {
      this.parentName = location[0].replace('Location: ', '');
      this.parentId = -1;
    }
  }
}

export class ZoneUtil {
  static languages = [
    {key: 'en', locales: ['en_GB', 'en_US', 'pl_PL'], type: 'Type: ', territory: 'Territory: '},
    {key: 'fr', locales: ['fr_FR'], type: 'Type: ', territory: 'Territoire: '},
    {key: 'it', locales: ['it_IT'], type: 'Tipo: ', territory: 'Territorio: '},
    {key: 'es', locales: ['es_MX', 'es_ES'], type: 'Tipo: ', territory: 'Territorio: '},
    {key: 'pt', locales: ['pt_PT', 'pt_BR'], type: 'Tipo: ', territory: 'Território: '},
    {key: 'de', locales: ['de_DE'], type: 'Art: ', territory: 'Territorium: '},
    {key: 'ru', locales: ['ru_RU'], type: 'Тип: ', territory: 'Территория: '},
    {key: 'kr', locales: ['ko_KR'], type: '유형: ', territory: '영토: '},
    {key: 'cn', locales: ['zh_TW'], type: '类型: ', territory: '地域: '}
  ];

  /* Istanbul ignore next */
  static setParentValuesAndAddToDB(zones: Zone[]): Promise<Zone[]> {
    return new Promise<Zone[]>((resolve, reject) => {
      const list: Zone[] = zones.map(zone => {
        if (zone.parentName) {
          const parentMatch: Zone[] = zones.filter(parentZone =>
            parentZone.name.en_GB === zone.parentName);
          if (parentMatch && parentMatch.length) {
            zone.parentId = parentMatch[0].id;
            delete zone.parentName;
          } else {
            console.log('Could not find ', zone.parentName);
          }
        }
        return zone;
      }).sort((a, b) => a.parentId && !b.parentId ? 1 : -1);
      const promises = [];
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      list.forEach(zone => promises.push(
        promiseThrottle.add(() => this.insertZoneIntoDB(zone))));
      Promise.all(promises)
        .then(() => console.log('Success!'))
        .catch((error) => {
          console.error(error);
        });
      resolve(list);
    });
  }

  /* Istanbul ignore next */
  static getFromDB(locale = 'en_GB'): Promise<Zone[]> {
    return new DatabaseUtil().query(`
    SELECT
             i.id,
             COALESCE(${locale}, 'MISSING THE LOCALE IN DB!') as name,
             territoryId,
             typeId,
             parentId,
             minLevel,
             maxLevel
             timestamp
      FROM zone as i
      LEFT OUTER JOIN zoneName as l
      ON i.id = l.id;`);
  }

  private static insertZoneIntoDB(zone: Zone): Promise<any> {
    const insert = {
      id: zone.id,
      territoryId: zone.territoryId,
      typeId: zone.typeId,
      minLevel: zone.minLevel,
      maxLevel: zone.maxLevel
    };
    if (zone.parentId) {
      insert['parentId'] = zone.parentId;
    }
    return new DatabaseUtil().query(
      new QueryUtil('zone').insert(insert)).then(() =>
      LocaleUtil.insertToDB('zoneName', 'id', {id: zone.id, ...zone.name}))
      .catch((error) => {
        if (!TextUtil.contains(error.error, 'ER_DUP_ENTRY:')) {
          console.error('Failed with: ' + insert.id, error);
        }
      });
  }

  static getById(id: number): Promise<Zone> {
    return new Promise<Zone>((resolve, reject) => {
      const zone: Zone = new Zone(id),
        promises: Promise<any>[] = [];

      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      this.languages
        .forEach(lang => promises.push(
          promiseThrottle.add(() => this.getZoneDataForLocale(id, lang, zone))));
      Promise.all(promises)
        .then(() => resolve(zone))
        .catch(reject);
    });
  }

  private static getZoneDataForLocale(id: number, language: ZoneLanguage, zone: Zone): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/tooltip/zone/${id}?locale=${language.key}`, true)
        .then(({body}) => resolve(zone.setData(body, language)))
        .catch((error) => {
          console.error({
            id,
            error
          });
          resolve(undefined);
        });
    });
  }
}
