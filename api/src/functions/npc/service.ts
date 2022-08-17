import {NPCRepository} from './repository';
import {DatabaseUtil} from '../../utils/database.util';
import {NPC} from './model';
import {NPCUtil} from './util';

const PromiseThrottle: any = require('promise-throttle');

export class NPCService {
  private util = new NPCUtil();

  addOrUpdateById(id: number, db?: DatabaseUtil): Promise<NPC> {
    const isDBProvided = !!db;
    const closeIfNotProvided = () => {
      if (!isDBProvided) {
        db.end();
      }
    };

    if (!isDBProvided) {
      db = new DatabaseUtil(false);
    }
    const service = new NPCRepository(db);
    return new Promise<NPC>(((resolve, reject) => {
      this.util.fetch(id)
        .then(npc => {
          service.insertOrUpdate(npc)
            .then(res => {
              closeIfNotProvided();
              resolve(res);
            })
            .catch(error => {
              closeIfNotProvided();
              reject(error);
            });
        })
        .catch(error => {
          closeIfNotProvided();
          reject(error);
        });
    }));
  }

  findMissingNPCsFromLatestExpansion(): Promise<void> {
    const db = new DatabaseUtil(false);
    const repository = new NPCRepository(db);
    return new Promise<void>(async (resolve, reject) => {
      const existingIds = await repository.getAllIds();
      repository.getAllFromLatestExpansionFromItems()
        .then(async ids => {
          const newIds = ids.filter(id => !existingIds.has(id));
          const promiseThrottle = new PromiseThrottle({
            requestsPerSecond: 1,
            promiseImplementation: Promise
          });

          let completed = 0;
          let successfull = 0;
          const count = newIds.length;

          const startTime = +new Date();
          const promises: Promise<any>[] = [];
          newIds.forEach(id => promises.push(
            promiseThrottle.add(() =>
              new Promise(async (success, fail) => {
                /*
                if (DateUtil.timeSince(startTime, 's') > 200) {
                  success();
                  return;
                }
                */
                this.addOrUpdateById(id, db)
                  .then(() => {
                    completed++;
                    successfull++;
                    console.log(`Completed ${completed} / ${count} (${
                      Math.round(completed / count * 100)}%)`);
                    success();
                  })
                  .catch(error => {
                      completed++;
                      console.error(error);
                      success(error);
                    }
                  );
              }).catch(console.error))));
          db.enqueueHandshake()
            .then(() => {
              Promise.all(promises)
                .then(() => {
                  db.end();
                  resolve();
                })
                .catch(error => {
                  db.end();
                  reject(error);
                });
            })
            .catch(error => {
              db.end();
              reject(error);
            });
        })
        .catch(error => {
          db.end();
          reject(error);
        });
    });
  }
}