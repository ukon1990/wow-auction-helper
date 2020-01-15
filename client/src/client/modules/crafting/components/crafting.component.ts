import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Recipe} from '../models/recipe';
import {GameBuild} from '../../../utils/game-build.util';
import {itemClasses} from '../../../models/item/item-classes';
import {ColumnDescription} from '../../table/models/column-description';
import {SharedService} from '../../../services/shared.service';
import {User} from '../../../models/user/user';
import {Crafting} from '../models/crafting';
import {Filters} from '../../../utils/filtering';
import {ObjectUtil} from '@ukon1990/js-utilities/dist/utils/object.util';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  filtered: Array<Recipe> = new Array<Recipe>();
  subs = new SubscriptionManager();
  itemClasses = itemClasses;
  professions = [
    ...GameBuild.professions,
    'none'
  ].sort();
  expansions = GameBuild.expansionMap;
  delayFilter = false;

  columns: Array<ColumnDescription> = [];

  constructor(private _formBuilder: FormBuilder, private _title: Title) {
    SharedService.events.title.next('Crafting');
    const query = localStorage.getItem('query_crafting') === null ?
      undefined : JSON.parse(localStorage.getItem('query_crafting'));

    this.searchForm = this._formBuilder.group({
      searchQuery: query && query.searchQuery !== undefined ? query.searchQuery : '',
      onlyKnownRecipes: query && query.onlyKnownRecipes !== undefined ? query.onlyKnownRecipes : true,
      profession: query && query.profession ? query.profession : 'All',
      profit: query && query.profit !== null ? parseFloat(query.profit) : 0,
      demand: query && query.demand !== null ? parseFloat(query.demand) : 0,
      minSold: query && query.minSold !== null ? parseFloat(query.minSold) : 0,
      intermediate: query && SharedService.user.useIntermediateCrafting !== null ?
        SharedService.user.useIntermediateCrafting : true,
      itemClass: query ? query.itemClass : '-1',
      itemSubClass: query ? query.itemSubClass : '-1',

      // Disenchanting
      selectedDEMaterial: query && query.selectedDisenchanting ? query.selectedDisenchanting : 0,
      DEOnlyProfitable: query && query.onlyProfitable ? query.onlyProfitable : false,
      expansion: query && query.expansion ? query.expansion : null
    });
  }

  ngOnInit() {
    this.addColumns();
    this.filter();

    this.subs.add(
      this.searchForm.valueChanges,
      (() => {
        localStorage['query_crafting'] = JSON.stringify(this.searchForm.value);

        if (!this.delayFilter) {
          this.delayFilter = true;
          setTimeout(() => {
            this.filter();
            this.delayFilter = false;
          }, 100);
        }
      }));

    this.subs.add(
      SharedService.events.auctionUpdate,
      (changes) =>
        this.filter(changes));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  addColumns(): void {
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'reagents', title: 'Materials', dataType: 'materials', hideOnMobile: true});
    this.columns.push({key: 'cost', title: 'Cost', dataType: 'gold', hideOnMobile: true});
    this.columns.push({key: 'buyout', title: 'Buyout', dataType: 'gold'});
    this.columns.push({key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true});
    this.columns.push({key: 'roi', title: 'Profit', dataType: 'gold'});
    this.columns.push({key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true});
    this.columns.push({key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true});
    this.columns.push({key: undefined, title: 'In cart', dataType: 'cart-recipe-count'});
  }

  filter(changes?: any): void {
    if (!changes) {
      changes = this.searchForm.getRawValue();
    }
    if (SharedService.user.useIntermediateCrafting !== changes.intermediate) {
      // We need to update those crafting costs as we changed our strategy
      SharedService.user.useIntermediateCrafting = changes.intermediate;
      User.save();
      Crafting.calculateCost();
    }
    console.log(changes);

    this.filtered = SharedService.recipes
      .filter(recipe => {
        if (!EmptyUtil.isNullOrUndefined(recipe)) {
          return this.isKnownRecipe(recipe)
          && this.isNameMatch(recipe, changes.searchQuery)
          && Filters.isProfitMatch(recipe, undefined, changes.profit)
          && Filters.isSaleRateMatch(recipe.itemID, changes.demand, false)
          && Filters.isDailySoldMatch(recipe.itemID, changes.minSold, false)
          && Filters.isProfessionMatch(recipe.itemID, changes.profession)
          && Filters.isItemClassMatch(recipe.itemID, changes.itemClass, changes.itemSubClass)
          && Filters.isExpansionMatch(recipe.itemID, changes.expansion);
        }
        return false;
      });
  }

  isKnownRecipe(recipe: Recipe): boolean {
    return !this.searchForm.value.onlyKnownRecipes || SharedService.recipesForUser[recipe.spellID] || !recipe.profession;
  }

  isNameMatch(recipe: Recipe, name: string): boolean {
    if (EmptyUtil.isNullOrUndefined(name)) {
      return true;
    }
    if (TextUtil.contains(recipe.name, name)) {
      return true;
    }
    const item =  SharedService.items[recipe.itemID];
    return item && TextUtil.contains(item.name, name);
  }


  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
