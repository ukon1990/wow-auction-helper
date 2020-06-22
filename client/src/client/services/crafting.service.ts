import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SharedService} from './shared.service';
import {Recipe} from '../modules/crafting/models/recipe';
import {Endpoints} from './endpoints';
import {DatabaseService} from './database.service';
import {ErrorReport} from '../utils/error-report.util';
import {Platform} from '@angular/cdk/platform';
import {BehaviorSubject} from 'rxjs';
import {CraftingUtil} from '../modules/crafting/utils/crafting.util';
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

  static list: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static fullList: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static map: BehaviorSubject<Map<number, Recipe>> = new BehaviorSubject(new Map<number, Recipe>());
  static itemRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());
  static reagentRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());

  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_recipes';

  static getRecipesForFaction(recipes: Recipe[]): Recipe[] {
    const result = [];
    recipes.forEach(recipe => {
      if (!recipe || !recipe.reagents) {
        return;
      }
      const itemId = this.getItemIdForCurrentFaction(recipe);
      if (!itemId) {
        return;
      }
      recipe.itemID = itemId;
      result.push(recipe);
    });
    return result;
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

  async loadRecipes(latestTimestamp: Date) {
    await this.dbService.getAllRecipes()
      .then(async (result) => {
        this.handleRecipes({recipes: result, timestamp: localStorage['timestamp_recipes']});
        if (CraftingService.list.value.length === 0) {
          delete localStorage['timestamp_recipes'];
        }
      })
      .catch(async (error) =>
        ErrorReport.sendError('CraftingService.loadRecipes', error));

    const timestamp = localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP);

    if (!CraftingService.list.value.length || !timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
      await this.getRecipes();
    }
    this.setOnUseCraftsWithNoReagents();
  }

  async getRecipes(): Promise<any> {
    const locale = localStorage['locale'];
    const timestamp = localStorage[this.LOCAL_STORAGE_TIMESTAMP];
    console.log('Downloading recipes');

    if (!timestamp) {
      this.dbService.clearRecipes();
    }

    SharedService.downloading.recipes = true;
    return this._http.get(`${Endpoints.S3_BUCKET}/recipe/${locale}.json.gz?rand=${Math.round(Math.random() * 10000)}`)
      .toPromise()
      .then((result: RecipeResponse) => {
        SharedService.downloading.recipes = false;
        this.handleRecipes(result);
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.recipes = false;
      });
  }

  updateRecipe(spellID: number): Promise<Recipe> {
    return this._http.patch(Endpoints.getLambdaUrl(`recipe/${spellID}`), {
      locale: localStorage['locale']
    })
      .toPromise() as Promise<Recipe>;
  }

  /* TODO: Is this one really needed now?
  async handleRecipe(r: Recipe, missingItems?: Array<number>): Promise<Recipe> {
    const possiblyBuggedRecipe = !r.professionId && r.name.indexOf('Create ') !== -1;
    if (missingItems && r.itemID > 0 && !SharedService.items[r.itemID]) {
      missingItems.push(r.itemID);
    }

    if (possiblyBuggedRecipe) {
      r.flaggedAsBugged = true;
    }

    SharedService.recipesMap[r.id] = r;
    return r;
  }*/

  handleRecipes(recipes: RecipeResponse): void {
    SharedService.downloading.recipes = false;
    const list = CraftingService.fullList.value,
      map = CraftingService.map.value;

    recipes.recipes.forEach(recipe => {
      if (!map.get(recipe.id)) {
        list.push(recipe);
      }
      map.set(recipe.id, recipe);
    });

    try {
      if (this.platform !== null && !this.platform.WEBKIT) {
        this.dbService.addRecipes(list);
        localStorage[this.LOCAL_STORAGE_TIMESTAMP] = recipes.timestamp;
      }
    } catch (error) {
      console.error(error);
    }
    CraftingService.map.next(map);
    CraftingService.fullList.next(list);
    CraftingService.list.next(CraftingService.getRecipesForFaction(list));
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
      SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
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
