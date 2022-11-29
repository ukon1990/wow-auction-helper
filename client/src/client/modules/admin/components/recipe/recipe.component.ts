import {Component} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'wah-recipe',
  templateUrl: './recipe.component.html'
})
export class RecipeComponent {
  isProcessingRecipes = false;
  form: FormGroup = new FormGroup({
    isClassic: new FormControl(false),
    recipeId: new FormControl(),
  });
  comparison = new BehaviorSubject<{db: any, api: any}>(undefined);
  comparisonError = new BehaviorSubject<any>(undefined);

  constructor(
    private service: AdminService,
  ) { }

  getComparison(): void {
    this.comparisonError.next(undefined);
    this.service.getCompareRecipeAPI(this.form.value.recipeId)
      .then(comparison => this.comparison.next(comparison))
      .catch(error => this.comparisonError.next(error));
  }
}