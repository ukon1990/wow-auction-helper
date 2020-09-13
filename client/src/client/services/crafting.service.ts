import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SharedService} from './shared.service';
import {Recipe} from '../modules/crafting/models/recipe';
import {Endpoints} from './endpoints';
import {DatabaseService} from './database.service';
import {ErrorReport} from '../utils/error-report.util';
import {Platform} from '@angular/cdk/platform';
import {BehaviorSubject} from 'rxjs';
import {Item} from '../models/item/item';
import {ItemSpells} from '../models/item/itemspells';
import {Reagent} from '../modules/crafting/models/reagent';
import wordsToNumbers from 'words-to-numbers';

class RecipeResponse {
  timestamp: Date;
  recipes: Recipe[];
}

@Injectable()
export class CraftingService {

  constructor(private _http: HttpClient,
              private dbService: DatabaseService,
              public platform: Platform) {
  }

  static recipesForUser: BehaviorSubject<Map<number, string[]>> = new BehaviorSubject(new Map<number, string[]>());
  static list: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static fullList: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static map: BehaviorSubject<Map<number, Recipe>> = new BehaviorSubject(new Map<number, Recipe>());
  static itemRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());
  static itemRecipeMapPerKnown: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());
  static reagentRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());

  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_recipes';

  static getRecipesForFaction(recipes: Recipe[]): Recipe[] {
    const result = [];
    const itemMap = new Map<number, Recipe[]>();
    const itemReagentMap = new Map<number, Recipe[]>();
    recipes.forEach(recipe => {
      if (!recipe || !recipe.reagents) {
        return;
      }
      const itemId = this.getItemIdForCurrentFaction(recipe);
      if (!itemId) {
        return;
      }
      recipe.itemID = itemId;
      this.addRecipeToItemMap(itemMap, itemId, recipe);
      recipe.reagents.forEach(reagent => {
        this.addRecipeToItemMap(itemReagentMap, reagent.id, recipe);
      });
      result.push(recipe);
    });
    CraftingService.itemRecipeMap.next(itemMap);
    CraftingService.reagentRecipeMap.next(itemReagentMap);
    return result;
  }

  private static addRecipeToItemMap(itemMap: Map<number, Recipe[]>, itemId: number, recipe: Recipe) {
    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, [recipe]);
    } else {
      itemMap.get(itemId).push(recipe);
    }
  }

  private static getItemIdForCurrentFaction(recipe: Recipe): number {
    let itemId = recipe.craftedItemId;
    if (!itemId) {
      if (!SharedService.user.faction) {
        itemId = recipe.allianceCraftedItemId;
      } else {
        itemId = recipe.hordeCraftedItemId;
      }
    }
    return itemId;
  }

  async load(latestTimestamp: Date) {
    await this.dbService.getAllRecipes()
      .then(async (result) => {
        this.handleRecipes(result);
        if (CraftingService.list.value.length === 0) {
          delete localStorage['timestamp_recipes'];
        }
      })
      .catch(async (error) =>
        ErrorReport.sendError('CraftingService.loadRecipes', error));

    const timestamp = localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP);

    if (!CraftingService.list.value.length || !timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
      await this.get();
    }
    this.setOnUseCraftsWithNoReagents();
  }

  get(): Promise<any> {
    const locale = localStorage['locale'];
    console.log('Downloading recipes');

    SharedService.downloading.recipes = true;
    return this._http.get(`${Endpoints.S3_BUCKET}/recipe/${locale}.json.gz?rand=${Math.round(Math.random() * 10000)}`)
      .toPromise()
      .then(async (result: RecipeResponse) => {
        SharedService.downloading.recipes = false;
        await this.clearAndSaveResult(result);
        this.handleRecipes(result.recipes);
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.recipes = false;
      });
  }

  private async clearAndSaveResult(result: RecipeResponse) {
    await this.dbService.clearRecipes();
    try {
      if (this.platform !== null && !this.platform.WEBKIT) {
        await this.dbService.addRecipes(result.recipes);
        localStorage[this.LOCAL_STORAGE_TIMESTAMP] = result.timestamp;
      }
    } catch (error) {
      console.error(error);
    }
  }

  updateRecipe(spellID: number): Promise<Recipe> {
    return this._http.patch(Endpoints.getLambdaUrl(`recipe/${spellID}`), {
      locale: localStorage['locale']
    })
      .toPromise() as Promise<Recipe>;
  }

  handleRecipes(recipes: Recipe[]): void {
    SharedService.downloading.recipes = false;
    const list = recipes,
      map = new Map<number, Recipe>(),
      itemRecipeMapPerKnown = new Map<number, Recipe[]>();

    CraftingService.list.next(CraftingService.getRecipesForFaction(list));

    list.forEach(recipe => {
      map.set(recipe.id, recipe);
      if (CraftingService.recipesForUser.value.has(recipe.id)) {
        if (!itemRecipeMapPerKnown.has(recipe.itemID)) {
          itemRecipeMapPerKnown.set(recipe.itemID, [recipe]);
        } else {
          itemRecipeMapPerKnown.get(recipe.itemID).push(recipe);
        }
      }
    });

    CraftingService.itemRecipeMapPerKnown.next(itemRecipeMapPerKnown);
    CraftingService.map.next(map);
    CraftingService.fullList.next(list);
    SharedService.events.recipes.emit(true);
    console.log('Recipe download is completed');
  }

  /**
   * Checks all items for possible create effects
   *
   * PS: Another wastefull function, I hope that this does not impact performance too much...
   * @static
   * @memberof Crafting
   */
  private setOnUseCraftsWithNoReagents(): void {
    let tmpList = [];
    SharedService.itemsUnmapped.forEach(i =>
      tmpList = tmpList.concat(this.getItemForSpellsThatAreRecipes(i)));

    tmpList.forEach(recipe => {
      CraftingService.list.value.push(recipe);
      CraftingService.itemRecipeMapPerKnown.value.set(recipe.itemID, [recipe]);
    });
  }

  /**
   * Generating recipes from spell text and spell ID
   *
   * @static
   * @param {Item} item
   * @returns {Recipe[]}
   * @memberof Crafting
   */
  private getItemForSpellsThatAreRecipes(item: Item): Recipe[] {
    const list: Recipe[] = [];
    if (item.itemClass === 7 && item.itemSpells !== null &&
      item.itemSpells && item.itemSpells.length > 0) {
      item.itemSpells.forEach((spell: ItemSpells) => {
        if (CraftingService.map.value.get(spell.SpellID)
          && CraftingService.map.value.get(spell.SpellID).itemID &&
          CraftingService.map.value.get(spell.SpellID).reagents) {

          const recipe = new Recipe(),
            reagent = new Reagent(),
            originalRecipe: Recipe = CraftingService.map.value.get(spell.SpellID),
            name = SharedService.items[originalRecipe.itemID].name,
            regex = new RegExp(/[0-9]{1,}/gi);

          if (originalRecipe.reagents && originalRecipe.reagents.length > 1) {
            return;
          }

          const numbers = regex.exec(wordsToNumbers(spell.Text) + ''),
            quantity = numbers !== null && numbers.length > 0 && numbers[0] ? parseInt(numbers[0], 10) : 1,
            createsQuantity = numbers !== null && numbers.length > 1 && numbers[1] ? parseInt(numbers[1], 10) : 1;

          recipe.id = spell.SpellID;
          recipe.name = `${name.indexOf('Create') === -1 ? 'Create ' : ''}${name}`;
          recipe.itemID = originalRecipe.itemID;
          recipe.minCount = createsQuantity;
          recipe.maxCount = createsQuantity;
          reagent.id = item.id;
          reagent.name = item.name;
          reagent.quantity = quantity;
          recipe.reagents = [];
          recipe.reagents.push(reagent);

          if (originalRecipe.reagents.length === 0 || originalRecipe.flaggedAsBugged) {
            originalRecipe.reagents = recipe.reagents;
            originalRecipe.minCount = recipe.minCount;
            originalRecipe.maxCount = recipe.maxCount;
          } else {
            list.push(recipe);
          }
        }
      });
    }
    return list;
  }
}
