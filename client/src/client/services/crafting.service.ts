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

class RecipeResponse {
  timestamp: Date;
  recipes: Recipe[];
}

@Injectable()
export class CraftingService {

  static recipesForUser: BehaviorSubject<Map<number, string[]>> = new BehaviorSubject(new Map<number, string[]>());
  static loadedGameBuild: BehaviorSubject<number> = new BehaviorSubject(0);
  static list: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static fullList: BehaviorSubject<Recipe[]> = new BehaviorSubject([]);
  static map: BehaviorSubject<Map<number, Recipe>> = new BehaviorSubject(new Map<number, Recipe>());
  static knownRecipeMap: BehaviorSubject<Map<number, Recipe>> = new BehaviorSubject(new Map<number, Recipe>());
  static itemRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());
  static itemRecipeMapPerKnown: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());
  static reagentRecipeMap: BehaviorSubject<Map<number, Recipe[]>> = new BehaviorSubject(new Map<number, Recipe[]>());

  lastModified: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  lastModifiedClassic: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private _http: HttpClient,
              private dbService: DatabaseService,
              public platform: Platform) {
  }
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
      // It is ok for enchants to not create an item
      if (!itemId && recipe.professionId !== 333) {
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
      if (!SharedService.user.faction && recipe.allianceCraftedItemId) {
        itemId = recipe.allianceCraftedItemId;
      } else if (recipe.hordeCraftedItemId) {
        itemId = recipe.hordeCraftedItemId;
      }
    }
    return itemId;
  }

  private getStorageKey(isClassic: boolean) {
    return `${this.LOCAL_STORAGE_TIMESTAMP}${isClassic ? '_classic' : ''}`;
  }

  async load(latestTimestamp: Date, isClassic = SharedService.user.gameVersion > 0) {
    if (!latestTimestamp) {
      latestTimestamp = new Date(
        isClassic ? this.lastModifiedClassic.value : this.lastModified.value);
    }
    await this.dbService.getAllRecipes(isClassic)
      .then(async (result) => {
        this.handleRecipes(result);
        if (CraftingService.list.value.length === 0) {
          delete localStorage[this.getStorageKey(isClassic)];
        }
      })
      .catch(async (error) =>
        ErrorReport.sendError('CraftingService.loadRecipes', error));

    const timestamp = localStorage.getItem(this.getStorageKey(isClassic));

    if (!CraftingService.list.value.length || !timestamp || +new Date(latestTimestamp) > +new Date(timestamp)) {
      await this.get(isClassic);
    }
    this.setOnUseCraftsWithNoReagents();
  }

  get(isClassic: boolean): Promise<any> {
    const locale = localStorage['locale'];
    console.log('Downloading recipes');

    SharedService.downloading.recipes = true;
    return this._http.get(`${Endpoints.S3_BUCKET}${
      isClassic ? '/classic' : ''
    }/recipe/${locale}.json.gz?lastModified=${this.lastModified.value}`)
      .toPromise()
      .then(async (result: RecipeResponse) => {
        SharedService.downloading.recipes = false;
        await this.clearAndSaveResult(result, isClassic);
        this.handleRecipes(result.recipes);
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.recipes = false;
      });
  }

  private async clearAndSaveResult(result: RecipeResponse, isClassic: boolean) {
    await this.dbService.clearRecipes();
    try {
      if (this.platform !== null && !this.platform.WEBKIT) {
        await this.dbService.addRecipes(result.recipes, isClassic);
        localStorage[this.getStorageKey(isClassic)] = result.timestamp;
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
      map = new Map<number, Recipe>();

    CraftingService.list.next(CraftingService.getRecipesForFaction(list));

    this.setItemRecipeMapPerKnown(map);

    CraftingService.map.next(map);
    CraftingService.fullList.next(list);
    SharedService.events.recipes.emit(true);
    console.log('Recipe download is completed');
  }

  setItemRecipeMapPerKnown(map: Map<number, Recipe> = CraftingService.map.value, list: Recipe[] = CraftingService.list.value): void {
    const itemRecipeMapPerKnown = new Map<number, Recipe[]>();
    const knownRecipeMap = new Map<number, Recipe>();
    list.forEach(recipe => {
      map.set(recipe.id, recipe);
      if (CraftingService.recipesForUser.value.has(recipe.id)) {
        knownRecipeMap.set(recipe.id, recipe);
        if (!itemRecipeMapPerKnown.has(recipe.itemID)) {
          itemRecipeMapPerKnown.set(recipe.itemID, [recipe]);
        } else {
          itemRecipeMapPerKnown.get(recipe.itemID).push(recipe);
        }
      }
    });
    CraftingService.knownRecipeMap.next(knownRecipeMap);
    CraftingService.itemRecipeMapPerKnown.next(itemRecipeMapPerKnown);
  }

  /**
   * Checks all items for possible create effects
   *
   * PS: Another wastefull function, I hope that this does not impact performance too much...
   * @static
   * @memberof Crafting
   */
  private setOnUseCraftsWithNoReagents(): void {
    /*
    TODO: Remove the previously used package for this is depricated (words-to-numbers)
    let tmpList = [];
    SharedService.itemsUnmapped.forEach(i =>
      tmpList = tmpList.concat(this.getItemForSpellsThatAreRecipes(i)));
    tmpList.forEach(recipe => {
      CraftingService.list.value.push(recipe);
      CraftingService.itemRecipeMapPerKnown.value.set(recipe.itemID, [recipe]);
    });
    */
  }

  /**
   * Generating recipes from spell text and spell ID
   * @deprecated The package words-to-numbers is depricated
   * TODO: Remove once confirmed that I don't actually need it afterall (The result of this should be in the database instead)
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

          const numbers = ['0'], // regex.exec(wordsToNumbers(spell.Text) + ''),
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
