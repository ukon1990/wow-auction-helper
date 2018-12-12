import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { CraftingService } from '../../services/crafting.service';
import { Recipe } from '../../models/crafting/recipe';
import { ItemService } from '../../services/item.service';
import { Filters } from '../../models/filtering';
import { FormControl } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'wah-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  inProd = environment.production;
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

  constructor(private _craftingService: CraftingService, private _itemService: ItemService) { }

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
      SharedService.recipes
        .filter((recipe: Recipe) =>
          Filters.isExpansionMatch(recipe.itemID, new FormControl(7)))
        .forEach(r => {
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
  } //updateItem

  getRecipeCount(): number {
    return this.updated.recipes.list.length;
  }

  /**
   * Items
  */
  getItemProgress(): number {
    return this.updated.items.completed.length / this.getItemCount() * 100;
  }

  updateItems(i?: number): void {
    if (!i) {
      i = 0;
      this.updated.items.list = [];
      Object.keys(SharedService.items).forEach(itemID => {
        if (itemID && SharedService.items[itemID] && SharedService.items[itemID].expansionId === 7) {
          this.updated.items.list.push(SharedService.items[itemID]);
        }
      });
    }

    if (this.updated.items.list.length === 0) {
      return;
    }

    setTimeout(() => {
      if (this.updated.items.list[i]) {
        this._itemService.updateItem(this.updated.items.list[i].id).then(r => {
          this.updated.items.completed.push(this.updated.items.list[i].name);
          console.log('Current progress:' + this.getItemProgress());
        }).catch(e => {
          console.error('Something went wrong:', e);
          this.updated.items.completed.push('Null');
          this.updated.items.failed.push(this.updated.items.list[i] ? this.updated.items.list[i].name : 'Null');
        });
      } else {
        console.log('Skipping undefined recipe');
        this.updated.items.completed.push('Undefined');
        this.updated.items.skipped++;
      }

      i++;
      if (i === this.getItemCount()) {
        console.log('Done updating', i);
        return;
      } else {
        this.updateItems(i);
      }
    }, 100);
  } // updateItem

  getItemCount(): number {
    return this.updated.items.list.length;
  }
}
