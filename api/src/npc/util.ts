import { NPC } from './model';
import {languages} from '../static-data/language.data';
import {Language} from '../models/language.model';
import {HttpClientUtil} from '../utils/http-client.util';
import { Item } from '@shared/models';

const PromiseThrottle: any = require('promise-throttle');

export class NPCUtil {
  private http = new HttpClientUtil();

  constructor() {
  }

  fetch(id: number): Promise<NPC> {
    return new Promise((resolve, reject) => {
      const npc: NPC = new NPC(id),
        promises: Promise<any>[] = [];

      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: languages.length,
        promiseImplementation: Promise
      });

      languages
        .forEach(lang => promises.push(
          promiseThrottle.add(() => this.getNpcDataWithLocale(id, lang, npc))));

      Promise.all(promises)
        .then(() => resolve(npc))
        .catch(reject);
    });
  }

  getIdsFromItems(items: Item[]): number[] {
    const ids: number[] = [];
    const map = new Map<number, number>();

    const addIfMissing = (id: number) => {
      if (!map.has(id)) {
        map.set(id, id);
        ids.push(id);
      }
    };

    items.forEach(item => {
      item.itemSource = JSON.parse('' + item.itemSource);
      if (item.itemSource.soldBy) {
        item.itemSource.soldBy.forEach(soldBy => addIfMissing(soldBy.id));
      }

      if (item.itemSource.droppedBy) {
        item.itemSource.droppedBy.forEach(droppedBy => addIfMissing(droppedBy.id));
      }
    });
    return ids;
  }

  private getNpcDataWithLocale(id: number, language: Language, npc: NPC) {
    return new Promise<NPC>((resolve, reject) => {
      this.http.get(`https://www.wowhead.com/tooltip/npc/${id}?locale=${language.key}`, true)
        .then(async ({body}) => {
          try {
            await this.getHtmlAndSetNPCData(id, npc, language);
            resolve(npc.setData(body, language));
          } catch (e) {
            console.error(e);
            resolve(npc);
          }
        })
        .catch((error) => {
          console.error({
            id,
            error
          });
          resolve(undefined);
        });
    });
  }

  private getHtmlAndSetNPCData(id: number, npc: NPC, language: Language) {
    return new Promise<any>((resolve, reject) => {
      const urlPrefix = language.key === 'en' ? 'www' : language.key;
      this.http.get(`https://${urlPrefix}.wowhead.com/npc=${id}`, false)
        .then(({body}) => {
          npc.setFromWowHead(body, language);
          resolve(npc);
        })
        .catch(reject);
    });
  }
}