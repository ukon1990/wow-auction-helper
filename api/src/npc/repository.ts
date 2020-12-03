import {DatabaseUtil} from '../utils/database.util';
import {NPC} from '../utils/npc.util';
import {ItemLocale} from '../models/item/item-locale';

export class NPCRepository {
  constructor(private db: DatabaseUtil, private locale: string = 'en_GB') {
  }

  getAll(): Promise<NPC[]> {
    return new Promise<NPC[]>(((resolve, reject) => {
      this.db.query(`
          SELECT *
          FROM npc
          ORDER BY timestamp desc;
      `)
        .then(async (rows: NPC[]) => {
          const list: NPC[] = [];
          const map = new Map<number, NPC>();
          rows.forEach(npc => {
            map.set(npc.id, npc);
            list.push(npc);
          });
          await Promise.all([
            this.getAllNamesOrTags(map, 'Name'),
            this.getAllNamesOrTags(map, 'Tag')
          ])
            .then(() => {
              resolve(list);
            })
            .catch(reject);
        })
        .catch(reject);
    }));
  }

  private getAllNamesOrTags(map: Map<number, NPC>, type: string): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.db.query(`
            SELECT id, ${this.locale} as name
            FROM npc${type}
            WHERE id in (select id from npc);`)
        .then((rows: any[]) =>
          rows.forEach(row => map.get(row.id)[type.toLowerCase()] = row.name))
        .catch(reject);
    }));
  }
}
