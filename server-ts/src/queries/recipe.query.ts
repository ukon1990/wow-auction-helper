import { safeifyString } from '../util/string.util';
import { Pet } from '../models/pet';
import { Recipe } from '../models/crafting/recipe';

export class RecipeQuery {
  public static update(recipe: Recipe): string {

    return `
    UPDATE recipes SET json = "${
      safeifyString(JSON.stringify(recipe))
      }", timestamp = CURRENT_TIMESTAMP
    WHERE id = ${
      recipe.spellID
      };`;
  }

  public static insert(recipe: Recipe): string {
    return `INSERT INTO recipes VALUES(${
      recipe.spellID
    }, "${
      safeifyString(JSON.stringify(recipe))
    }", CURRENT_TIMESTAMP);`;
  }
}