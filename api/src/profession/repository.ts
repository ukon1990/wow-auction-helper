import {Repository} from '../core/repository';
import {Profession} from './model';
import {DatabaseUtil} from '../utils/database.util';

export class ProfessionRepository extends Repository<Profession> {
  delete(id: number): Promise<Profession> {
    return undefined;
  }

  getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<Profession[]> {
    return new Promise<Profession[]>(((resolve, reject) => {
      db.query(``)
        .then((rows) => {
          
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