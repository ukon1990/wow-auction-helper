import {Recipe} from '../models/crafting/recipe';
import {safeifyString} from '../utils/string.util';
import {getLocale} from '../utils/locale.util';
import {Reagent} from '../models/crafting/reagent';

export class RecipeQuery {
  public static update(recipe: Recipe) {
    return `
          UPDATE recipes
          SET
            json = "${safeifyString(JSON.stringify(recipe))}",
            timestamp = CURRENT_TIMESTAMP
          WHERE id = ${recipe.spellID};`;
  }

  public static insert(id: number, recipe) {
    return `INSERT INTO recipes VALUES(${
      id
      }, "${
      safeifyString(JSON.stringify(recipe))
      }", CURRENT_TIMESTAMP);`;
  }

  public static getSelectIdFromRecipesWhereIdNotInSelectIdFromRecipeNameLocale(): string {
    return `SELECT id
            FROM recipes
            WHERE id NOT IN
                  (
                    SELECT id
                    FROM recipe_name_locale);`;
  }

  /*
  * Old version had:
  * json NOT LIKE '%itemID":0%' AND ..
  */
  public static getAllRecipesAfterTimestamp(locale: string, timestamp: Date) {
    return `
      SELECT r.id, json, ${getLocale(locale)} as name, timestamp from  recipes as r
      LEFT OUTER JOIN recipe_name_locale as l
      ON r.id = l.id
      WHERE timestamp > "${timestamp + ''}"
      ORDER BY timestamp desc;`;
  }

  public static getById(id: number) {
    return `SELECT json
            FROM recipes
    WHERE id = ${id}`;
  }

  public static getItemWithSimilarName(recipe) {
    return `select id from items where name like "%${recipe.name}%" limit 1;`;
  }

  public static getMissingItems(recipe: Recipe): string {
    const ids = [];
    if (recipe.itemID) {
      ids.push(recipe.itemID);
    }
    recipe.reagents
      .forEach((reagent: Reagent) =>
        ids.push(reagent.itemID));

    return `
        SELECT id FROM (
      ${RecipeQuery.getFakeIdListTable(ids)}
    ) AS list
    LEFT JOIN items USING (id)
    WHERE items.id IS NULL
`;
  }

  private static getFakeIdListTable(ids: number[]) {
    let table = '';
    ids.forEach((id, index) => {
      table += `(SELECT ${id} AS id) `;
      if (index !== ids.length - 1) {
        table += 'UNION ALL ';
      }
    });
    return table;
  }
}
