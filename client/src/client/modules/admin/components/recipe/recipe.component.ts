import {Component} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {APIRecipe, ColumnDescription} from '@shared/models';
import {ColumnTypeEnum} from "@shared/enum";

@Component({
  selector: 'wah-recipe',
  templateUrl: './recipe.component.html'
})
export class RecipeComponent {
  isProcessingRecipes = false;
  isLoadingRecipes = false;
  form: FormGroup = new FormGroup({
    isClassic: new FormControl(false),
    recipeId: new FormControl(),
  });
  recipeFilter: FormGroup = new FormGroup({

  });
  recipeColumns: ColumnDescription[] = [
    {key: 'id', title: 'ID', dataType: ColumnTypeEnum.Number},
    {key: 'name', title: 'Name', dataType: ColumnTypeEnum.Name},
    {key: 'rank', title: 'Rank', dataType: ColumnTypeEnum.Number},
    {key: 'craftedItemId', title: 'Item Id', dataType: ColumnTypeEnum.Number},
    {key: 'hordeCraftedItemId', title: 'Horde item Id', dataType: ColumnTypeEnum.Number},
    {key: 'allianceCraftedItemId', title: 'Alliance item Id', dataType: ColumnTypeEnum.Number},
    {key: 'procRate', title: 'Proc rate', dataType: ColumnTypeEnum.Number},
    {key: 'professionId', title: 'Profession', dataType: ColumnTypeEnum.Number},
    {key: 'timestamp', title: 'Updated', dataType: ColumnTypeEnum.Date},
  ];
  recipes: APIRecipe[] = [];
  recipeForm = new FormArray([]);
  comparison = new BehaviorSubject<{db: any, api: any}>(undefined);
  comparisonError = new BehaviorSubject<any>(undefined);

  constructor(
    private service: AdminService,
  ) {
    this.getRecipes();
  }

  getComparison(): void {
    this.comparisonError.next(undefined);
    this.service.getCompareRecipeAPI(this.form.value.recipeId)
      .then(comparison => this.comparison.next(comparison))
      .catch(error => this.comparisonError.next(error));
  }

  getRecipes(): void {
    this.isLoadingRecipes = true;
    this.recipes = [];
    this.service.getAllRecipes()
      .then(({recipes}) => {
        this.recipes = recipes;
      })
      .finally(() => this.isLoadingRecipes = false);
  }
}