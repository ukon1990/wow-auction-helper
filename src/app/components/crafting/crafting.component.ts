import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../models/crafting/recipe';
import { SharedService } from '../../services/shared.service';
import { ColumnDescription } from '../../models/column-description';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit {
  searchForm: FormGroup;
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
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'reagents', title: 'Materials', dataType: 'materials' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: 'mktPrice', title: 'Market value', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: 'avgDailySold', title: 'Daily sold', dataType: 'number' },
    { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
  ];

  constructor(private _formBuilder: FormBuilder) {
    const query = localStorage.getItem('query_crafting') === null ?
      undefined : JSON.parse(localStorage.getItem('query_crafting'));

    this.searchForm = this._formBuilder.group({
      searchQuery: query && query.searchQuery !== undefined ? query.searchQuery : '',
      onlyMyRecipes: query && query.onlyMyRecipes !== undefined ? query.onlyMyRecipes : true,
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
  }

  getRecipes(): Array<Recipe> {
    if (this.filtered.length > 0) {
      return this.filtered;
    }
    return SharedService.recipes;
  }

  filter(): void {
    localStorage['query_crafting'] = JSON.stringify(this.searchForm.value);
    this.filtered = SharedService.recipes.filter(i => this.isMatch(i));
  }

  isMatch(recipe: Recipe): boolean {
    let match = true;

    if (this.searchForm.value.searchQuery.length > 0 &&
      recipe.name.toLowerCase().indexOf(this.searchForm.value.searchQuery.toLowerCase()) === -1) {
      match = false;
    }

    if (match && this.searchForm.value.profit !== 0 && recipe.roi < this.searchForm.value.profit * 10000) {
      match = false;
    }

    if (match && this.searchForm.value.demand !== 0 && recipe.regionSaleRate < this.searchForm.value.demand / 100) {
      match = false;
    }

    if (match && this.searchForm.value.minSold !== 0 && recipe.avgDailySold < this.searchForm.value.minSold) {
      match = false;
    }

    if (match && this.searchForm.value.profession !== 'All' && this.searchForm.value.profession !== recipe.profession) {
      match = false;
    }

    return match;
  }

}
