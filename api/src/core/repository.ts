import {DatabaseUtil} from '../utils/database.util';
import {format} from 'sqlstring';

export abstract class Repository<T> {
    protected constructor(
        public table: string,
        public localeTable: string
    ) {
    }

    abstract getById(id: number): Promise<T>;

    abstract getAllAfter(timestamp: number): Promise<T[]>;

    abstract insert(data: T): Promise<T>;

    abstract update(data: T): Promise<T>;

    abstract delete(id: number): Promise<T>;
}
