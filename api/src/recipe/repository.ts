import {Repository} from '../core/repository';
import {Recipe} from '../models/crafting/recipe';
import {DatabaseUtil} from '../utils/database.util';
import {format} from 'sqlstring';

export class RecipeRepository extends Repository<Recipe> {
    constructor() {
        super('recipes', 'recipe_name_locale');
    }
    delete(id: number): Promise<Recipe> {
        return Promise.resolve(undefined);
    }

    /**
     SELECT r.id, json, ${getLocale(locale)} as name, timestamp from  recipes as r
     LEFT OUTER JOIN recipe_name_locale as l
     ON r.id = l.id
     WHERE UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000}
     ORDER BY timestamp desc;
     * @param timestamp
     * @param db
     */
    getAllAfter(timestamp: number, db: DatabaseUtil): Promise<Recipe[]> {
        return db.query(format());
    }

    getById(id: number): Promise<Recipe> {
        return Promise.resolve(undefined);
    }

    insert(data: Recipe): Promise<Recipe> {
        return Promise.resolve(undefined);
    }

    update(data: Recipe): Promise<Recipe> {
        return Promise.resolve(undefined);
    }

}
