import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Recipe} from '../models/recipe';
import {GameBuild} from '../../../utils/game-build.util';
import {itemClasses} from '../../../models/item/item-classes';
import {ColumnDescription} from '../../table/models/column-description';
import {SharedService} from '../../../services/shared.service';
import {Filters} from '../../../utils/filtering';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {AuctionsService} from '../../../services/auctions.service';
import {ThemeUtil} from '../../core/utils/theme.util';
import {CraftingService} from '../../../services/crafting.service';
import {ProfessionService} from '../services/profession.service';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit, OnDestroy {
  theme = ThemeUtil.current;
  searchForm: FormGroup;
  filtered: Recipe[] = [];
  subs = new SubscriptionManager();
  itemClasses = itemClasses;
  professions = [];
  expansions = GameBuild.expansionMap;
  delayFilter = false;

  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'reagents', title: 'Materials (min vs avg price)', dataType: 'materials', hideOnMobile: true},
    {key: 'cost', title: 'Cost', dataType: 'gold', hideOnMobile: true},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true},
    {key: 'roi', title: 'Profit', dataType: 'gold'},
    {key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true},
    {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];

  constructor(private _formBuilder: FormBuilder, private _title: Title,
              private service: AuctionsService, private professionService: ProfessionService) {
    SharedService.events.title.next('Crafting');
    const query = localStorage.getItem('query_crafting') === null ?
      undefined : JSON.parse(localStorage.getItem('query_crafting'));

    this.searchForm = this._formBuilder.group({
      searchQuery: query && query.searchQuery !== undefined ? query.searchQuery : '',
      onlyKnownRecipes: query && query.onlyKnownRecipes !== undefined ? query.onlyKnownRecipes : true,
      professionId: query && query.professionId ? query.professionId : 0,
      profit: query && query.profit !== null ? parseFloat(query.profit) : 0,
      demand: query && query.demand !== null ? parseFloat(query.demand) : 0,
      minSold: query && query.minSold !== null ? parseFloat(query.minSold) : 0,
      itemClass: query ? query.itemClass : '-1',
      itemSubClass: query ? query.itemSubClass : '-1',

      // Disenchanting
      selectedDEMaterial: query && query.selectedDisenchanting ? query.selectedDisenchanting : 0,
      DEOnlyProfitable: query && query.onlyProfitable ? query.onlyProfitable : false,
      expansion: query && query.expansion ? query.expansion : null
    });
  }

  ngOnInit() {
    this.filter();

    this.subs.add(
      this.searchForm.valueChanges,
      ((changes) => {
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
      this.service.events.groupedList,
      () =>
        this.filter());

    this.subs.add(this.professionService.listWithRecipes, (professions) => {
      this.professions = [
        {
          id: 0,
          name: 'All',
        },
        ...(this.getProfessionsSorted(professions)),
        {
          id: -1,
          name: 'None'
        }
      ];
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  filter(changes = this.searchForm.value): void {
    this.filtered = CraftingService.list.value
      .filter(recipe => {
        if (!EmptyUtil.isNullOrUndefined(recipe)) {
          return this.isKnownRecipe(recipe)
            && this.isNameMatch(recipe, changes.searchQuery)
            && Filters.isProfitMatch(recipe, undefined, changes.profit)
            && Filters.isSaleRateMatch(recipe.itemID, changes.demand, false)
            && Filters.isDailySoldMatch(recipe.itemID, changes.minSold, false)
            && Filters.isProfessionMatch(recipe.itemID, changes.professionId)
            && Filters.isItemClassMatch(recipe.itemID, changes.itemClass, changes.itemSubClass)
            && Filters.isExpansionMatch(recipe.itemID, changes.expansion);
        }
        return false;
      });
  }

  isKnownRecipe(recipe: Recipe): boolean {
    return !this.searchForm.value.onlyKnownRecipes || SharedService.recipesForUser[recipe.id] || !recipe.professionId;
  }

  isNameMatch(recipe: Recipe, name: string): boolean {
    if (EmptyUtil.isNullOrUndefined(name)) {
      return true;
    }
    if (TextUtil.contains(recipe.name, name)) {
      return true;
    }
    const item = SharedService.items[recipe.itemID];
    return item && TextUtil.contains(item.name, name);
  }

  resetForm() {
    this.searchForm.reset({
      strategy: SharedService.user.craftingStrategy,
      intermediate: SharedService.user.useIntermediateCrafting
    });
  }

  private getProfessionsSorted(professions) {
    return professions.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }
}
