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
    {key: 'name', title: 'Name', dataType: ColumnTypeEnum.FormControlText, options: {disabled: true}},
    {key: 'itemName', title: 'ItemName', dataType: ColumnTypeEnum.Name},
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
      title: 'Actions',
      dataType: ColumnTypeEnum.RowActions,
      actions: [{
        icon: 'fa fa-save',
        text: 'Save',
        tooltip: 'Save',
        callback: (group: FormGroup) => this.updateRecipe(group),
      }]
    },
  ];
  recipes: APIRecipe[] = [];
  recipesMap: Map<number, APIRecipe> = new Map();
  recipeForm = new FormArray([]);
  recipesMissingCraftedId: FormArray = new FormArray([]);
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

  addMissingValue(group: FormGroup) {
    const {name, minCount, maxCount} = group.getRawValue();
    const recipe = group.getRawValue() as APIRecipe;
    if (
      !recipe.craftedItemId && !recipe.allianceCraftedItemId && !recipe.hordeCraftedItemId ||
      !recipe.minCount || !recipe.maxCount
    ) {
      const itemsWithMatchingNames = ItemService.list.value
        .filter(item =>
          !TextUtil.contains(item.name, 'Pattern') &&
          !TextUtil.contains(item.name, 'Design') &&
          TextUtil.contains(item.name, name)
        )
        // Having the smallest item id first (as this will likely be a quality 1 version over 2 or 3
        .sort((a, b) => a.id - b.id);
      if (itemsWithMatchingNames.length) {
        const firstItem = itemsWithMatchingNames[0];
        group.controls.itemName.setValue(firstItem.name);
        group.controls.craftedItemId.setValue(firstItem.id);
        group.controls.craftedItemId.markAsDirty();
      }

      if (!minCount || !maxCount) {
        group.controls.minCount.setValue(1);
        group.controls.minCount.markAsDirty();
        group.controls.maxCount.setValue(1);
        group.controls.maxCount.markAsDirty();
      }

    }
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
    const formArray = new FormArray([]);
    const withMissingIds = new FormArray([]);
    this.recipesMap = new Map();

    this.service.getAllRecipes()
      .then(({recipes}) => {
        this.recipes = recipes;
        recipes.forEach(recipe => {
          this.recipesMap.set(recipe.id, recipe);

          const formGroup = new FormGroup({
            id: new FormControl<number>({value: recipe.id, disabled: true}),
            name: new FormControl<string>({value: recipe.name, disabled: true}),
            itemName: new FormControl<string>(null),
            rank: new FormControl<number>({value: recipe.rank, disabled: true}),
            craftedItemId: new FormControl<number>(recipe.craftedItemId),
            hordeCraftedItemId: new FormControl<number>(recipe.hordeCraftedItemId),
            allianceCraftedItemId: new FormControl<number>(recipe.allianceCraftedItemId),
            procRate: new FormControl<number>(recipe.procRate),
            minCount: new FormControl<number>(recipe.minCount),
            maxCount: new FormControl<number>(recipe.maxCount),
            professionId: new FormControl<number>({value: recipe.professionId, disabled: true}),
            timestamp: new FormControl<string>({value: new Date(recipe.timestamp).toJSON(), disabled: true}),
          });
          formArray.push(formGroup);
          this.addMissingValue(formGroup);
        });

        this.recipeForm = formArray;
        this.recipesMissingCraftedId = withMissingIds;
        this.filterRecipes();
      })
      .finally(() => this.isLoadingRecipes = false);
  }

  private updateRecipe(recipe: FormGroup) {
    const storedRecipe = this.recipesMap.get(recipe.value.id);
    const changes = {
      id: recipe.getRawValue().id,
    } as APIRecipe;
    Object.keys(recipe.controls)
      .forEach(key => {
        if (key === 'itemName') {
          return;
        }

        const control = recipe.controls[key] as FormControl;
        // We only want to update changed fields
        if ((control.dirty && control.enabled)) {
          changes[key] = control.value;
        }
      });
    console.log('Changed fields', recipe, changes, storedRecipe);
    if (Object.keys(changes).length <= 1) {
      this.snackBar.open('There is nothing to update');
      return;
    }
    this.service.updateRecipe(changes)
      .then(() => {
        this.snackBar.open(`Successfully saved recipe: ${recipe.value.name}`, 'Ok');
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
}