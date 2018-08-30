import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Recipe } from '../models/crafting/recipe';
import { Endpoints } from './endpoints';
import { ItemService } from './item.service';
import { GameBuild } from '../utils/game-build.util';
import { Item } from '../models/item/item';
import { DatabaseService } from './database.service';
import { ErrorReport } from '../utils/error-report.util';
import { Angulartics2 } from 'angulartics2';

@Injectable()
export class CraftingService {
  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_recipes';

  constructor(private _http: HttpClient,
    private _itemService: ItemService,
    private dbService: DatabaseService,
    private angulartics2: Angulartics2) { }

  getRecipe(spellID: number): void {
    this._http.get(Endpoints.getUrl(`recipe/${spellID}?locale=${localStorage['locale']}`))
      .toPromise()
      .then(r =>
        this.handleRecipe(r as Recipe))
      .catch(error => {
        console.error(`Could not get recipe ${spellID}`, error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  async getRecipes(): Promise<any> {
    const locale = localStorage['locale'];
    let timestamp = localStorage[this.LOCAL_STORAGE_TIMESTAMP];
    console.log('Downloading recipes');
    SharedService.downloading.recipes = true;

    if (!timestamp) {
      this.dbService.clearRecipes();
      await this._http.get(`https://s3-eu-west-1.amazonaws.com/wah-data/recipes-${ locale }.json.gz`)
        .toPromise()
        .then(result => {
          timestamp = result['timestamp'];
          SharedService.recipes.length = 0;
          this.handleRecipes(result);
        })
        .catch(error =>
          ErrorReport.sendHttpError(error, this.angulartics2));
    }

    SharedService.downloading.recipes = true;
    return this._http.post(
      Endpoints.getUrl(`recipe?locale=${ locale }`),
      {
        timestamp:  timestamp ? timestamp : new Date('2000-06-30').toJSON()
      })
      .toPromise()
      .then(recipes => this.handleRecipes(recipes))
      .catch(error => {
        SharedService.downloading.recipes = false;
        console.error('Recipe download failed', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  updateRecipe(spellID: number): Promise<Recipe> {
    return this._http.patch(Endpoints.getUrl(`recipe/${spellID}`), null)
      .toPromise() as Promise<Recipe>;
  }

  private handleRecipe(r: Recipe, missingItems?: Array<number>): void {
    const possiblyBuggedRecipe = !r.profession && r.name.indexOf('Create ') !== -1;
    if (missingItems && r.itemID > 0 && !SharedService.items[r.itemID]) {
      missingItems.push(r.itemID);
    }

    r.reagents.forEach(reagent => {
      if (reagent.itemID > 0 && !SharedService.items[reagent.itemID]) {
        this._itemService.addItem(reagent.itemID);
      }
    });

    if (possiblyBuggedRecipe) {
      r.flaggedAsBugged = true;
    }

    SharedService.recipesMap[r.spellID] = r;
  }

  handleRecipes(recipes: any): void {
    const missingItems = [],
      noRecipes = SharedService.recipes.length === 0;
    SharedService.downloading.recipes = false;

    recipes['recipes'].forEach((recipe: Recipe) => {
      if (SharedService.recipesMap[recipe.spellID]) {
        Object.keys(recipe).forEach(key => {
          SharedService.recipesMap[recipe.spellID][key] = recipe[key];
        });
        // In case of a full clear
        if (noRecipes) {
          SharedService.recipes.push(recipe);
        }
      } else {
        SharedService.recipes.push(recipe);
      }
    });
    console.log('Recipe download is completed');

    // Adding items if there are any missing
    SharedService.recipes.forEach(r => {
      this.handleRecipe(r, missingItems);
    });

    if (missingItems.length < 100) {
      this._itemService.addItems(missingItems);
    }

    this.dbService.addRecipes(SharedService.recipes);
    localStorage[this.LOCAL_STORAGE_TIMESTAMP] = new Date().toJSON();
  }

  /**
   * Throtteled adding of missing items
   *
   * @param {Array<number>} recipesToAdd A list of item id's that needs to be added
   * @param {number} [i] the next index to add
   * @returns {void}
   * @memberof ItemService
   */
  addRecipes(recipesToAdd: Array<number>, i?: number): void {
    if (!i) {
      i = 0;
    }

    if (recipesToAdd.length === 0) {
      return;
    }

    setTimeout(() => {
      if (recipesToAdd[i]) {
        SharedService.recipesMap[i] = new Recipe();
        this.getRecipe(recipesToAdd[i]);
      }

      i++;
      if (i === recipesToAdd.length) {
        console.log(`Done adding ${i} recipes`);
        return;
      } else {
        this.addRecipes(recipesToAdd, i);
      }
    }, 100);
  }
}
