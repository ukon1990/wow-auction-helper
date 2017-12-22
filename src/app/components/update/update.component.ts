import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { CraftingService } from '../../services/crafting.service';
import { Recipe } from '../../models/crafting/recipe';

@Component({
  selector: 'wah-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  updated = {
    recipes: {
      completed: [],
      skipped: 0,
      failed: [],
      list: []
    },
    items: {
      completed: [],
      skipped: 0,
      failed: [],
      list: []
    },
    pets: {
      completed: [],
      skipped: 0,
      failed: [],
      list: []
    }
  };

  constructor(private _craftingService: CraftingService) { }

  ngOnInit() {
    this.updated.recipes.list = SharedService.recipes;
  }

  /**
   * Recipes
  */

  getRecipeProgress(): number {
    return this.updated.recipes.completed.length / this.getRecipeCount() * 100;
  }

  updateRecipes(i?: number): void {
    if (!i) {
      i = 0 ;
      this.updated.recipes.list = [];
      SharedService.recipes.forEach(r => {
        if (r) {
          this.updated.recipes.list.push(r);
        }
      });
    }

    if (this.updated.recipes.list.length === 0) {
      return;
    }

    setTimeout(() => {
      if (this.updated.recipes.list[i]) {
        this._craftingService.updateRecipe(this.updated.recipes.list[i].spellID).then(r => {
          this.updated.recipes.completed.push(this.updated.recipes.list[i].name);
          console.log('Current progress:' + this.getRecipeProgress());
        }).catch(e => {
          console.error('Something went wrong:', e);
          this.updated.recipes.completed.push('Null');
          this.updated.recipes.failed.push(this.updated.recipes.list[i] ? this.updated.recipes.list[i].name : 'Null');
        });
      } else {
        console.log('Skipping undefined recipe');
        this.updated.recipes.completed.push('Undefined');
        this.updated.recipes.skipped++;
      }

      i++;
      if (i === this.getRecipeCount()) {
        console.log('Done updating', i);
        return;
      } else {
        this.updateRecipes(i);
      }
    }, 100);
  }

  getRecipeCount(): number {
    return this.updated.recipes.list.length;
  }
}
