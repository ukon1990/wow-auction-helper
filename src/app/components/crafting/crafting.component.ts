import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from '../../models/crafting/recipe';
import { SharedService } from '../../services/shared.service';
import { ColumnDescription } from '../../models/column-description';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  formChanges: Subscription;
  filtered: Array<Recipe> = new Array<Recipe>();
  professions = [
    'First Aid',
    'Blacksmithing',
    'Leatherworking',
    'Alchemy',
    'Cooking',
    'Mining',
    'Tailoring',
    'Engineering',
    'Enchanting',
    'Jewelcrafting',
    'Inscription'
  ].sort();
  craftManually = ['Choose manually', 'None', 'Only if it\'s cheaper', 'Do it for everything!'];
  columns: Array<ColumnDescription> = [];

  constructor(private _formBuilder: FormBuilder) {
    const query = localStorage.getItem('query_crafting') === null ?
      undefined : JSON.parse(localStorage.getItem('query_crafting'));

    this.searchForm = this._formBuilder.group({
      searchQuery: query && query.searchQuery !== undefined ? query.searchQuery : '',
      onlyKnownRecipes: query && query.onlyKnownRecipes !== undefined ? query.onlyKnownRecipes : true,
      profession: query && query.profession ? query.profession : 'All',
      profit: query && query.profit !== null ? parseFloat(query.profit) : 0,
      demand: query && query.demand !== null ? parseFloat(query.demand) : 0,
      minSold: query && query.minSold !== null ? parseFloat(query.minSold) : 0,
      craftManually: query && query.craftManually !== null ? query.craftManually : this.craftManually[0],
      selectedDEMaterial: query && query.selectedDisenchanting ? query.selectedDisenchanting : 0,
      DEOnlyProfitable: query && query.onlyProfitable ? query.onlyProfitable : false
    });
  }

  ngOnInit() {
    this.addColumns();
    this.formChanges = this.searchForm.valueChanges.subscribe(() => {
      localStorage['query_crafting'] = JSON.stringify(this.searchForm.value);
    });
  }

  ngOnDestroy() {
    this.formChanges.unsubscribe();
  }

  addColumns(): void {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'reagents', title: 'Materials', dataType: 'materials' });
    this.columns.push({ key: 'cost', title: 'Cost', dataType: 'gold' });
    this.columns.push({ key: 'buyout', title: 'Buyout', dataType: 'gold' });

    if (SharedService.user.apiToUse === 'tsm') {
      this.columns.push({ key: 'mktPrice', title: 'Market value', dataType: 'gold' });
    }

    this.columns.push({ key: 'roi', title: 'ROI', dataType: 'gold' });
    if (SharedService.user.apiToUse === 'tsm') {
      this.columns.push({ key: 'avgDailySold', title: 'Daily sold', dataType: 'number' });
      this.columns.push({ key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' });
    }

    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] });
  }

  getRecipes(): Array<Recipe> {
    return this.filter();
  }

  filter(): Array<Recipe> {
    return SharedService.recipes
    .filter(recipe =>
      this.isKnownRecipe(recipe)
      && this.isNameMatch(recipe)
      && this.isProfitMatch(recipe)
      && this.isSaleRateMatch(recipe)
      && this.isMinSoldMatch(recipe)
      && this.isProfessionMatch(recipe));
  }

  isKnownRecipe(recipe: Recipe): boolean {
    return !this.searchForm.value.onlyKnownRecipes || SharedService.recipesForUser[recipe.spellID];
  }

  isNameMatch(recipe: Recipe): boolean {
    return this.searchForm.value.searchQuery === null ||
      this.searchForm.value.searchQuery.length === 0 ||
      recipe.name.toLowerCase()
        .indexOf(this.searchForm.value.searchQuery.toLowerCase()) > -1 ||
      (SharedService.items[recipe.itemID] &&
        SharedService.items[recipe.itemID].name.toLowerCase()
        .indexOf(this.searchForm.value.searchQuery.toLowerCase()) > -1);
  }

  isProfitMatch(recipe: Recipe): boolean {
    return this.searchForm.value.profit === null || this.searchForm.value.profit === 0 ||
    recipe.buyout > 0 && recipe.cost > 0 && this.searchForm.value.profit <= recipe.roi / recipe.cost * 100;
  }

  isSaleRateMatch(recipe: Recipe): boolean {
    return this.searchForm.value.demand === null || this.searchForm.value.demand === 0 ||
    recipe.regionSaleRate >= this.searchForm.value.demand / 100;
  }

  isMinSoldMatch(recipe: Recipe): boolean {
    return this.searchForm.value.minSold === null || this.searchForm.value.minSold === 0 ||
    this.searchForm.value.minSold <= recipe.avgDailySold;
  }

  isProfessionMatch(recipe: Recipe): boolean {
    return this.searchForm.value.profession === null || this.searchForm.value.profession === 'All' ||
      this.searchForm.value.profession === recipe.profession;
  }


  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
