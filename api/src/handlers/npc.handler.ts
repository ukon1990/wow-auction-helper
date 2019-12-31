import {NPC, NPCUtil} from '../utils/npc.util';

const PromiseThrottle: any = require('promise-throttle');

export class NpcHandler {
  static getByIds(ids: number[]): Promise<NPC[]> {
    return new Promise<NPC[]>((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      const promises = [];
      const progress = {
        processed: 0,
        length: ids.length
      };
      ids.forEach(id => promises.push(
        promiseThrottle.add(() => NPCUtil.getById(id, progress))));
      Promise.all(promises)
        .then((npcs: NPC[]) => {
          resolve(npcs);
          NPCUtil.insertEntriesIntoDB(npcs);
        })
        .catch(reject);
    });
  }
}
