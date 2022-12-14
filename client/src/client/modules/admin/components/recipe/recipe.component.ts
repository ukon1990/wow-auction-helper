import {Component, OnDestroy} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import {APIRecipe, ColumnDescription} from '@shared/models';
import {ColumnTypeEnum} from '@shared/enum';
import {ItemService} from '../../../../services/item.service';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AdminRecipeUtil} from "./admin-recipe.util";
import {MatDialog} from "@angular/material/dialog";
import {RecipeDialogComponent} from "./recipe-dialog/recipe-dialog.component";

@Component({
  selector: 'wah-recipe',
  templateUrl: './recipe.component.html',
  styles: [`
      ::ng-deep .column-xs .mat-mdc-form-field {
          width: 5rem !important;
      }

      ::ng-deep .column-s .mat-mdc-form-field {
          width: 8rem !important;
      }
  `]
})
export class RecipeComponent implements OnDestroy {
  isUpdatingJSONFiles = false;
  isLoadingRecipes = false;
  form: FormGroup = new FormGroup({
    isClassic: new FormControl<boolean>(false),
    recipeId: new FormControl<number>(null),
  });
  recipeFilter: FormGroup = new FormGroup({
    name: new FormControl<string>(null),
    isMissingCraftedId: new FormControl<boolean>(false),
    professionId: new FormControl<number>(null),
    hasAutoAddedItemId: new FormControl<boolean>(null),
  });
  professionColumn: ColumnDescription = {
    key: 'professionId',
    title: 'Profession',
    dataType: ColumnTypeEnum.FormControlSelect,
    options: {
      disabled: true,
      key: 'name',
      data: [],
    }
  };
  recipeColumns: ColumnDescription[] = [
    {key: 'id', title: 'ID', dataType: ColumnTypeEnum.FormControlNumber, options: {disabled: true}},
    {key: 'type', title: 'Type', dataType: ColumnTypeEnum.FormControlText, options: {disabled: true}},
    {key: 'name', title: 'Name', dataType: ColumnTypeEnum.FormControlText, options: {disabled: true}},
    {key: 'itemName', title: 'ItemName', dataType: ColumnTypeEnum.Name, options: {idName: 'craftedItemId'}},
    {key: 'rank', title: 'Rank', dataType: ColumnTypeEnum.FormControlNumber, cssClass: 'column-xs'},
    {key: 'craftedItemId', title: 'Item Id', dataType: ColumnTypeEnum.FormControlNumber, cssClass: 'column-s'},
    {
      key: 'hordeCraftedItemId',
      title: 'Horde item Id',
      dataType: ColumnTypeEnum.FormControlNumber,
      cssClass: 'column-s'
    },
    {
      key: 'allianceCraftedItemId',
      title: 'Alliance item Id',
      dataType: ColumnTypeEnum.FormControlNumber,
      cssClass: 'column-s'
    },
    {key: 'procRate', title: 'Proc rate', dataType: ColumnTypeEnum.FormControlNumber, cssClass: 'column-xs'},
    {key: 'minCount', title: 'Min created', dataType: ColumnTypeEnum.FormControlNumber, cssClass: 'column-xs'},
    {key: 'maxCount', title: 'Max created', dataType: ColumnTypeEnum.FormControlNumber, cssClass: 'column-xs'},
    this.professionColumn,
    {key: 'timestamp', title: 'Updated', dataType: ColumnTypeEnum.FormControlText, options: {disabled: true}},
    {
      key: '',
      title: 'Edit',
      dataType: ColumnTypeEnum.RowActions,
      actions: [{
        icon: 'fa fa-edit',
        text: '',
        tooltip: 'Edit',
        callback: (group: FormGroup) => this.editRecipe(group),
      }]
    },
    {
      key: '',
      title: 'Save',
      dataType: ColumnTypeEnum.RowActions,
      actions: [{
        icon: 'fa fa-save',
        text: '',
        tooltip: 'Save',
        callback: (group: FormGroup) => this.updateRecipe(group),
      }]
    },
  ];
  recipes: APIRecipe[] = [];
  recipesMap: Map<number, APIRecipe> = new Map();
  recipeForm = new FormArray([]);
  filteredRecipes: FormGroup[] = [];
  comparison = new BehaviorSubject<{ db: any, api: any }>(undefined);
  comparisonError = new BehaviorSubject<any>(undefined);
  subs = new Subscription();
  private professions: any[];

  constructor(
    private service: AdminService,
    private itemService: ItemService,
    private snackBar: MatSnackBar,
    private professionService: ProfessionService,
    private dialog: MatDialog,
  ) {
    this.getRecipes();


    this.subs.add(
      this.professionService.listWithRecipes.subscribe(
        (professions) => {
          this.professions = [
            {
              id: 0,
              name: 'All',
            },
            ...(this.getProfessionsSorted(professions)),
            {
              id: -1,
              name: 'On use'
            }
          ];
          this.professionColumn.options.data = this.professions;
        })
    );

    this.subs.add(
      this.recipeFilter.valueChanges.subscribe(change => this.filterRecipes(change))
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
        this.recipeForm = AdminRecipeUtil.getRecipeFormArray(recipes, this.recipesMap);
        this.filterRecipes();
      })
      .finally(() => this.isLoadingRecipes = false);
  }

  private updateRecipe(recipe: FormGroup) {
    const storedRecipe = this.recipesMap.get(recipe.value.id);
    const changes = AdminRecipeUtil.getUpdatedValues(recipe);
    console.log('Changed fields', recipe, changes, storedRecipe);
    if (recipe.invalid) {
      this.snackBar.open('The recipe is not valid');
      return;
    }
    if (Object.keys(changes).length <= 1) {
      this.snackBar.open('There is nothing to update');
      return;
    }
    this.service.updateRecipe(changes)
      .then(() => {
        this.snackBar.open(`Successfully saved recipe: ${recipe.getRawValue().name}`, 'Ok');
        recipe.controls.timestamp.enable();
        recipe.controls.timestamp.setValue(new Date(recipe.getRawValue().timestamp).toJSON());
        recipe.controls.timestamp.disable();
      })
      .catch(error => this.snackBar.open(error.message, 'Ok'));
  }

  private getProfessionsSorted(professions) {
    return professions.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }

  updateRecipeJSONFilesRetail(): void {
    this.isUpdatingJSONFiles = true;
    this.service.updateRecipeJSONFilesRetail()
      .finally(() => this.isUpdatingJSONFiles = false);
  }

  private filterRecipes({
                          name: nameMatch,
                          isMissingCraftedId,
                          professionId: professionIdMatch,
                          hasAutoAddedItemId,
                        }: any = this.recipeFilter.getRawValue()) {
    this.filteredRecipes = this.recipeForm.controls.filter((group: FormGroup) => {
      const {
        name, craftedItemId, allianceCraftedItemId, hordeCraftedItemId, professionId
      } = group.getRawValue() as APIRecipe;
      const {itemName} = group.getRawValue();
      if (isMissingCraftedId && (craftedItemId || allianceCraftedItemId || hordeCraftedItemId)) {
        return false;
      }

      if (nameMatch && !TextUtil.contains(name, nameMatch)) {
        return false;
      }

      if (professionIdMatch && professionIdMatch !== professionId) {
        return false;
      }

      return !(hasAutoAddedItemId && !itemName);
    }) as FormGroup[];
  }

  private editRecipe(group: FormGroup): void {
    this.dialog.open(RecipeDialogComponent, {data: group});
  }
}