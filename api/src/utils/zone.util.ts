import {ItemLocale} from '../models/item/item-locale';
import {HttpClientUtil} from './http-client.util';

export class Zone {
  id: number;
  name: ItemLocale;
  patch: string;
  type: ItemLocale;
  territory: ItemLocale;
  level: number;
}

export class ZoneUtil {
  static getById(id: number): Promise<Zone> {
    // https://www.wowhead.com/zone=8717/boralus-harbor
    return new Promise<Zone>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/zone=${id}`, false)
        .then(({ body }) => resolve(this.extractZoneData(id, body)))
        .catch(() => reject('The zone could not be found'));
    });
  }

  private static extractZoneData(id: number, body: string) {
    const zone = new Zone();
    zone.id = id;
    zone.name = this.getName(body);
    return zone;
  }

  private static getName(body: string): ItemLocale {
      const nameRegex = new RegExp(/Added in patch [0-9]{1,2}\.[0-9]{1,2}/g),
        name = nameRegex.exec(body);
      const locale = new ItemLocale();
      locale.en_GB = name[0];
      return locale;
    }
}
