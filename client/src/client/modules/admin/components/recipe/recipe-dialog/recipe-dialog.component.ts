import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormGroup} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {Recipe} from '../../../../crafting/models/recipe';
import {AdminRecipeUtil} from '../admin-recipe.util';
import {APIRecipe, ColumnDescription} from '@shared/models';
import {ColumnTypeEnum} from '@shared/enum';

@Component({
  selector: 'wah-recipe-dialog',
  templateUrl: './recipe-dialog.component.html',
  styleUrls: ['./recipe-dialog.component.scss']
})
export class RecipeDialogComponent implements OnInit {
  form: FormGroup;
  get reagents(): FormArray {
    return this.form.controls.reagents as FormArray;
  }
  get modifiedSlots(): FormArray {
    return this.form.controls.modifiedReagents as FormArray;
  }

  reagentColumns: ColumnDescription[] = [
    {key: 'id', title: 'Item ID', dataType: ColumnTypeEnum.FormControlNumber},
    {key: 'name', title: 'name', dataType: ColumnTypeEnum.Name, options: {idName: 'id'}},
    {key: 'quantity', title: 'Quantity', dataType: ColumnTypeEnum.FormControlNumber},
  ];
  modifiedSlotColumns: ColumnDescription[] = [
    {key: 'id', title: 'Item ID', dataType: ColumnTypeEnum.FormControlNumber},
    {key: 'name', title: 'name', dataType: ColumnTypeEnum.Name},
    {key: 'slotOrder', title: 'Order', dataType: ColumnTypeEnum.FormControlNumber},
  ];

  constructor(
    private services: AdminService,
    private dialogRef: MatDialogRef<RecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public recipe: FormGroup | Recipe,
  ) {
  }

  ngOnInit(): void {
    console.log('Dialog open with', this.recipe);
    if (this.recipe instanceof FormGroup) {
      this.form = this.recipe;
    } else {
      this.form = AdminRecipeUtil.getFormGroupFromRecipe(this.recipe as APIRecipe);
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    console.log('To be saved', this.form.getRawValue());
  }
}