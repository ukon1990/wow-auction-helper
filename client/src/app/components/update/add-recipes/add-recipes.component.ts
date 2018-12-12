import { Component, OnInit } from '@angular/core';
import { CraftingService } from '../../../services/crafting.service';
import { FormControl } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Recipe } from '../../../models/crafting/recipe';

@Component({
  selector: 'wah-add-recipes',
  templateUrl: './add-recipes.component.html',
  styleUrls: ['./add-recipes.component.scss']
})
export class AddRecipesComponent implements OnInit {
  progress = {
    list: [],
    ids: [],
    completed: [],
    failed: []
  };
  input: FormControl = new FormControl();
  columns = [
    {title: 'ID', key: 'spellID', dataType: 'string'},
    {title: 'Name', key: 'name', dataType: 'string'},
    {title: 'Creates', key: 'itemID', dataType: 'string'},
    {title: 'Profession', key: 'profession', dataType: 'string'},
    {title: 'Rank', key: 'rank', dataType: 'string'},
    {title: 'Expansion', key: 'expansion', dataType: 'number'},
    {title: 'Is new', key: 'isNew', dataType: 'boolean'}
  ];

  constructor(private service: CraftingService) { }

  ngOnInit() {
  }

  addItems(): void {
    Object.keys(this.progress).forEach(key => {
      this.progress[key] = [];
    });
    this.progress.ids = this.input.value.replace(/[ a-zA-z]/g, '').split(',');
    this.addItem(0);
  }

  async addItem(index: number) {
    const id = this.progress.ids[index];
    if (SharedService.recipesMap[id]) {
      const recipe = SharedService.recipesMap[id],
        targetItem = SharedService.items[recipe.itemID];
      console.log(recipe);
      this.progress.completed.push({
        spellID: id,
        itemID: recipe.itemID,
        name: recipe.name,
        profession: recipe.profession,
        rank: recipe.rank,
        expansion: targetItem ? targetItem.expansion : -1,
        isNew: false
      });
    } else {
      await this.service.getRecipe(id)
        .then((recipe: Recipe) => {
          this.progress.completed.push({
            spellID: id,
            itemID: recipe.itemID,
            name: recipe.name,
            profession: recipe.profession,
            rank: recipe.rank,
            expansion: recipe.expansion,
            isNew: true
          });
        })
        .catch(() => {
          this.progress.failed.push(id);
        });
    }
    index++;
    if (index < this.progress.ids.length) {
      this.addItem(index);
    }
  }

  getProgress(): number {
    return (this.progress.completed.length + this.progress.failed.length) / this.progress.ids.length;
  }
}
