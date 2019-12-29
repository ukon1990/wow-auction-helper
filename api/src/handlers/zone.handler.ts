import {Zone, ZoneUtil} from '../utils/zone.util';

export class ZoneHandler {
  static getById(id: number): Promise<Zone> {
    return ZoneUtil.getById(id);
  }

  static getByIds(ids: number[]): Promise<Zone[]> {
    return new Promise<Zone[]>((resolve, reject) => {
      Promise.all(ids.map(id =>
        ZoneUtil.getById(id)))
        .then(resolve)
        .catch(reject);
    });
  }
}
