import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Recipe } from '../models/crafting/recipe';

@Injectable()
export class CraftingService {

  constructor(private _http: HttpClient) { }

  getRecipe(spellID: number): void {}

  getRecipes(): void {
    console.log('Downloading recipes');
    this._http.get('assets/mock/recipes.json')
      .toPromise()
      .then(recipes => {
        SharedService.recipes = recipes['recipes'];
        console.log('Recipe download is completed');
        console.log(recipes);
      })
      .catch(e => console.error('Recipe download failed', e));
  }

  updateRecipe(spellID: number) {
    this._http.get(`http://localhost/GetRecipe.php?spellId=${spellID}`)
      .toPromise();
  }
}
