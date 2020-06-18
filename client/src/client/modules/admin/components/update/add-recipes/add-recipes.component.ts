import { Component, OnInit } from '@angular/core';
import { CraftingService } from '../../../../../services/crafting.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { SharedService } from '../../../../../services/shared.service';
import { Recipe } from '../../../../crafting/models/recipe';

@Component({
  selector: 'wah-add-recipes',
  templateUrl: './add-recipes.component.html',
  styleUrls: ['./add-recipes.component.scss']
})
export class AddRecipesComponent implements OnInit {
  dbActions = [
    'Insert',
    'Update'
  ];
  progress = {
    list: [],
    ids: [],
    new: [],
    existing: [],
    failed: []
  };
  form: FormGroup;
  columns = [
    { title: 'ID', key: 'spellID', dataType: 'string' },
    { title: 'Name', key: 'name', dataType: 'string' },
    { title: 'Creates', key: 'itemID', dataType: 'string' },
    { title: 'Profession', key: 'profession', dataType: 'string' },
    { title: 'Rank', key: 'rank', dataType: 'string' },
    { title: 'Expansion', key: 'expansion', dataType: 'number' },
    { title: 'Is new', key: 'isNew', dataType: 'boolean' }
  ];
  columnsFailed = [
    { title: 'ID', key: 'spellID', dataType: 'string' },
    { title: 'Message', key: 'message', dataType: 'string' },
  ];

  constructor(private service: CraftingService, private fb: FormBuilder) {
    this.form = this.fb.group({
      input: new FormControl(),
      action: new FormControl(this.dbActions[0])
    });
  }

  ngOnInit() {}

  addItems(): void {
    Object.keys(this.progress).forEach(key => {
      this.progress[key] = [];
    });
    this.progress.ids = this.form.getRawValue().input.replace(/[ a-zA-z]/g, '').split(',');
    this.addItem(0);
  }

  async addItem(index: number) {
    const id = this.progress.ids[index];
    if (SharedService.recipesMap[id] && !this.shouldUpdate()) {
      const recipe = SharedService.recipesMap[id],
        targetItem = SharedService.items[recipe.itemID];
      this.progress.existing.push({
        spellID: id,
        itemID: recipe.itemID,
        name: recipe.name,
        profession: recipe.profession,
        rank: recipe.rank,
        expansion: targetItem ? targetItem.expansion : -1,
        isNew: false
      });
    } else {
      if (this.shouldUpdate()) {
        await this.service
          .updateRecipe(id)
          .then((recipe: Recipe) =>
            this.handleServiceResponse(recipe, id))
          .catch(() => {
            this.progress.failed.push(id);
          });
      } else {
        await this.service
          .getRecipe(id)
          .then((recipe: Recipe) =>
            this.handleServiceResponse(recipe, id))
          .catch(() => {
            this.progress.failed.push(id);
          });
      }
    }
    index++;
    if (index < this.progress.ids.length) {
      this.addItem(index);
    }
  }

  private shouldUpdate() {
    return this.dbActions[1] === this.form.getRawValue().action;
  }

  private handleServiceResponse(recipe: Recipe, id) {
    console.log('Result from request', recipe);
    if (!recipe || !recipe.name || recipe['error']) {
      this.progress.failed.push({
        spellID: id,
        columnsFailed: recipe['error']
      });
      return;
    }
    this.progress.new.push({
      spellID: id,
      itemID: recipe.itemID,
      name: recipe.name,
      profession: recipe.professionId,
      rank: recipe.rank,
      expansion: recipe.expansion,
      isNew: true
    });
  }

  getCompletedCount(): number {
    return this.progress.new.length + this.progress.existing.length + this.progress.failed.length;
  }

  getProgress(): number {
    return (
      this.getCompletedCount() /
      this.progress.ids.length
    );
  }
}
