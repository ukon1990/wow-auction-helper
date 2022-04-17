import {Repository} from '../core/repository';
import {Profession} from '@shared/models/profession/profession.model';
import {DatabaseUtil} from '../utils/database.util';

export class ProfessionRepository extends Repository<Profession> {

  constructor() {
    super('', '');
  }

  delete(id: number): Promise<Profession> {
    return undefined;
  }

  getAllAfter(timestamp: number, locale: string, db: DatabaseUtil = new DatabaseUtil()): Promise<Profession[]> {
    return new Promise<Profession[]>(((resolve, reject) => {
      db.query(`
        SELECT p.id AS id,
               skillTier.id  AS skillTierId,
               icon,
               n.${locale} as name,
               d.${locale} as description,
               type,
               skillTierName.${locale} AS skillTier,
               min,
               max,
               timestamp
        FROM professions AS p
          LEFT JOIN professionsName AS n ON n.id = p.id
          LEFT JOIN professionsDescription AS d ON d.id = p.id
          LEFT JOIN professionSkillTiers AS skillTier ON skillTier.professionId = p.id
          LEFT JOIN professionSkillTiersName AS skillTierName ON skillTierName.id = skillTier.id;`)
        .then((rows: any[]) => {
          const list = [], map = {};
          rows.forEach(row => {
            if (!map[row['id']]) {
              map[row['id']] = {
                id: row['id'],
                name: row['name'],
                description: row['description'],
                icon: row['icon'],
                type: row['type'],
                timestamp: row['timestamp'],
                skillTiers: []
              };

              list.push(map[row['id']]);
            }

            map[row['id']].skillTiers.push({
              id: row['skillTierId'],
              name: row['skillTier'],
              min: row['min'],
              max: row['max']
            });
          });

          resolve(list);
        })
        .catch(reject);
    }));
  }

  getById(id: number, locale: string, db: DatabaseUtil): Promise<Profession> {
    return undefined;
  }

  insert(data: Profession): Promise<Profession> {
    return undefined;
  }

  update(data: Profession): Promise<Profession> {
    return undefined;
  }

}