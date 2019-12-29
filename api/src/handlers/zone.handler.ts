import {Zone, ZoneUtil} from '../utils/zone.util';

export class ZoneHandler {
  static getById(id: number): Promise<Zone> {
    return ZoneUtil.getById(id);
  }

  static getByIds(ids: number[]): Promise<Zone[]> {/*
    return new Promise<Zone[]>((resolve, reject) => {
      // resolve(ZoneUtil.setParentValuesAndAddToDB());
      Promise.all(ids.map(id =>
        ZoneUtil.getById(id)))
        .then(resolve)
        .catch(reject);
    });*/
    return this.getFetchMissingIdsFrom(ids);
  }

  private static getFetchMissingIdsFrom(ids: number[]) {
    return new Promise<Zone[]>((resolve, reject) => {
      ZoneUtil.getFromDB()
        .then((zones) => {
          const zoneIdMap = {};
          zones.forEach(z => zoneIdMap[z.id] = z.id);

          const missingIds = ids.filter(id => !zoneIdMap[id]);

          Promise.all(missingIds.map(id =>
            ZoneUtil.getById(id)))
            .then((newZones) => {
              ZoneUtil.setParentValuesAndAddToDB(newZones);
              resolve(newZones);
            })
            .catch(reject);

        })
        .catch(reject);
    });
  }
}
