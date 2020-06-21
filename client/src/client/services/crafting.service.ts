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

    if (!timestamp || +latestTimestamp > +new Date(timestamp)) {
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
    return this._http.get(`${Endpoints.S3_BUCKET}/recipe/${locale}.json.gz`)
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
      tmpList = tmpList.concat(CraftingUtil.getItemForSpellsThatAreRecipes(i)));

    tmpList.forEach(recipe => {
      CraftingService.list.value.push(recipe);
      SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
    });
  }
}
