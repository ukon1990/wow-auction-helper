import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Recipe } from '../models/crafting/recipe';
import { Endpoints } from './endpoints';
import { ItemService } from './item.service';
import { GameBuild } from '../utils/game-build.util';
import { Item } from '../models/item/item';
import { DatabaseService } from './database.service';

@Injectable()
export class CraftingService {

  constructor(private _http: HttpClient, private _itemService: ItemService, private dbService: DatabaseService) { }

  getRecipe(spellID: number): void {
    this._http.get(Endpoints.getUrl(`recipe/${spellID}?locale=${ localStorage['locale'] }`))
      .toPromise()
        .then(r =>
          this.handleRecipe(r as Recipe))
        .catch(e => console.error(`Could not get recipe ${spellID}`, e));
  }

  getRecipes(): Promise<any> {
    console.log('Downloading recipes');
    SharedService.downloading.recipes = true;
    return this._http.get(Endpoints.getUrl(`recipe?locale=${ localStorage['locale'] }`))
      .toPromise()
      .then(recipes => {
        const missingItems = [];
        SharedService.downloading.recipes = false;
        SharedService.recipes = recipes['recipes'];
        console.log('Recipe download is completed');

        // Adding items if there are any missing
        SharedService.recipes.forEach(r => {
          this.handleRecipe(r, missingItems);
        });

        if (missingItems.length < 100) {
          this._itemService.addItems(missingItems);
        }

        this.dbService.addRecipes(SharedService.recipes);
        localStorage['timestamp_recipes'] = new Date().toDateString();
      })
      .catch(e => {
        SharedService.downloading.recipes = false;
        console.error('Recipe download failed', e);
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
      // TODO: Make a permanent fix for this in the backend.
      // As "Create ..." recipes need 10, but the api claims 9 etc, we need to +1 this.
      if (possiblyBuggedRecipe) {
        reagent.count++;
      }

      if (reagent.itemID > 0 && !SharedService.items[reagent.itemID]) {
        this._itemService.addItem(reagent.itemID);
      }
    });
    SharedService.recipesMap[r.spellID] = r;
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
        console.log(`Done adding ${ i } recipes`);
        return;
      } else {
        this.addRecipes(recipesToAdd, i);
      }
    }, 100);
  }
}
