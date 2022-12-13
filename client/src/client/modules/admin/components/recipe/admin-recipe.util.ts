import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {APIReagent, APIRecipe, ModifiedSlot} from '@shared/models';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {ItemService} from '../../../../services/item.service';

export class AdminRecipeUtil {
  static getRecipeFormArray(recipes: APIRecipe[], map: Map<number, APIRecipe> = new Map()): FormArray {
    const formArray = new FormArray([]);
    recipes.forEach(recipe => {
      map.set(recipe.id, recipe);

      const formGroup = this.getFormGroupFromRecipe(recipe);
      formArray.push(formGroup);
      this.addMissingValue(formGroup);
    });
    return formArray;
  }

  private static getReagentFormArray(reagents: APIReagent[] = []): FormArray {
    return new FormArray(
      reagents.map(reagent => new FormGroup({
        id: new FormControl<number>({value: reagent.id, disabled: true}),
        quantity: new FormControl<number>({value: reagent.id, disabled: true}),
      }))
    );
  }

  private static getModifiedSlots(modifiedSlots: ModifiedSlot[] = []): FormArray {
    return new FormArray(modifiedSlots.map(slot => new FormGroup({
      id: new FormControl<number>({value: slot.id, disabled: true}),
      slotOrder: new FormControl<number>({value: slot.id, disabled: true}),
    })));
  }

  private static getBonusIds(bonusIds: number[] = []): FormArray {
    return new FormArray(bonusIds.map(id => new FormControl(id)));
  }

  private static getFormGroupFromRecipe(recipe: APIRecipe) {
    return new FormGroup({
      id: new FormControl<number>({value: recipe.id, disabled: true}),
      type: new FormControl<string>({value: recipe.type, disabled: true}),
      name: new FormControl<string>({value: recipe.name, disabled: true}),
      itemName: new FormControl<string>(null),
      rank: new FormControl<number>({value: recipe.rank, disabled: true}),
      craftedItemId: new FormControl<number>(recipe.craftedItemId),
      hordeCraftedItemId: new FormControl<number>(recipe.hordeCraftedItemId),
      allianceCraftedItemId: new FormControl<number>(recipe.allianceCraftedItemId),
      reagents: this.getReagentFormArray(recipe.reagents),
      modifiedSlots: this.getModifiedSlots(recipe.modifiedSlots),
      bonusIds: this.getBonusIds(recipe.bonusIds),
      procRate: new FormControl<number>(recipe.procRate),
      minCount: new FormControl<number>(recipe.minCount),
      maxCount: new FormControl<number>(recipe.maxCount),
      professionId: new FormControl<number>({value: recipe.professionId, disabled: true}),
      timestamp: new FormControl<string>({value: new Date(recipe.timestamp).toJSON(), disabled: true}),
    });
  }

  static addMissingValue(group: FormGroup): void {
    const {name, minCount, maxCount} = group.getRawValue();
    const recipe = group.getRawValue() as APIRecipe;
    if (
      !recipe.craftedItemId && !recipe.allianceCraftedItemId && !recipe.hordeCraftedItemId ||
      !recipe.minCount || !recipe.maxCount
    ) {
      const isNotRecipe = (text: string) =>
        !TextUtil.contains(text, 'Pattern') &&
        !TextUtil.contains(text, 'Design') &&
        !TextUtil.contains(text, 'Technique') &&
        !TextUtil.contains(text, 'Formula') &&
        !TextUtil.contains(text, 'Schematic') &&
        !TextUtil.contains(text, 'Plans');
      const itemsWithMatchingNames = ItemService.list.value
        .filter(item =>
          isNotRecipe(item.name) && TextUtil.contains(item.name, name)
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

  /**
   * Return only the parameters that has any changes and are valid
   * @param recipe
   */
  static getUpdatedValues(recipe: FormGroup): APIRecipe {
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
    return changes;
  }
}