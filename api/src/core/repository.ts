import {DatabaseUtil} from '../utils/database.util';
import {format} from 'sqlstring';

export abstract class Repository<T> {
    protected constructor(
        public table: string,
        public localeTable: string
    ) {
    }

    abstract getById(id: number, locale: string, db: DatabaseUtil): Promise<T>;

    abstract getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<T[]>;

    abstract insert(data: T): Promise<any>;

    abstract update(data: T): Promise<T>;

    abstract delete(id: number): Promise<T>;
}
