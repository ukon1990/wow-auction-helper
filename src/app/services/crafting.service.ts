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
    this._http.get('http://wah.jonaskf.net/GetRecipe.php?v=3') // assets/mock/recipes.json
      .toPromise()
      .then(recipes => {
        SharedService.recipes = recipes['recipes'];
        console.log('Recipe download is completed');
      })
      .catch(e => console.error('Recipe download failed', e));
  }

  updateRecipe(spellID: number): Promise<Recipe> {
    return this._http.get(`http://localhost/GetRecipe.php?spellId=${spellID}`)
      .toPromise() as Promise<Recipe>;
  }
}
