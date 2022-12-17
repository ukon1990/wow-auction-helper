import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Recipe} from '../models/recipe';
import {GameBuild} from '@shared/utils';
import {ColumnDescription, ItemStats} from '@shared/models';
import {SharedService} from '../../../services/shared.service';
import {Filters} from '../../../utils/filtering';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {AuctionsService} from '../../../services/auctions.service';
import {ThemeUtil} from '../../core/utils/theme.util';
import {CraftingService} from '../../../services/crafting.service';
import {ProfessionService} from '../services/profession.service';
import {ItemClassService} from '../../item/service/item-class.service';
import {ItemClass} from '../../item/models/item-class.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {SettingsService} from '../../user/services/settings/settings.service';
import {RealmService} from '../../../services/realm.service';
import {AuthService} from '../../user/services/auth.service';
import {ColumnTypeEnum} from '@shared/enum';
import {MatDialog} from '@angular/material/dialog';
import {RecipeDialogComponent} from '../../admin/components/recipe/recipe-dialog/recipe-dialog.component';
import {CraftingFormFilterModel} from '../models/crafting-form-filter.model';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit, OnDestroy {
  isClassic = false;
  theme = ThemeUtil.current;
  searchForm: UntypedFormGroup;
  filtered: Recipe[] = [];
  subs = new SubscriptionManager();
  itemClasses: ItemClass[] = ItemClassService.classes.value;
  professions = [];
  expansions = [];
  private lastCalculationTime: number;

  columns: ColumnDescription[] = [
    {
      key: 'name', title: 'Name', dataType: 'name'/*, options: {
        tooltipType: 'recipe',
      }*/
    },
    {key: 'rank', title: 'Rank', dataType: ColumnTypeEnum.Number, hideOnMobile: true},
    {
      key: 'reagents',
      title: 'Materials (min vs avg price)',
      dataType: 'materials',
      hideOnMobile: true,
      canNotSort: true
    },
    {key: 'cost', title: 'Cost', dataType: 'gold', hideOnMobile: true},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true},
    {key: 'roi', title: 'Profit', dataType: 'gold'},
    {
      key: 'priceAvg24', title: '24H avg', dataType: 'gold', options: {
        tooltip: 'Avg price, for the past ~24 hours'
      }
    },
    {
      key: 'priceTrend', title: '7 Day trend', dataType: 'gold', options: {
        tooltip: 'Price trend per day, the past 7 days'
      }
    },
    {key: 'regionSaleRate', title: 'Sale rate (TSM)', dataType: 'percent', hideOnMobile: true},
    {
      key: 'past60DaysSaleRate',
      title: 'Pers. sale rate(60)',
      dataType: 'percent',
      options: {
        tooltip: `Displays your personal sale rate, the past 60 days. The calculation is based in data imported via the TSM addon.`
      },
      hideOnMobile: true
    },
    {
      key: 'inventoryQuantity',
      title: 'In inventory',
      dataType: 'number',
      options: {
        tooltip: `The calculation is based in data imported via the TSM addon.`
      },
      hideOnMobile: true
    },
    {
      key: undefined, title: 'In cart', dataType: 'cart-recipe-count', options: {
        idName: 'id',
      }
    }
  ];

  constructor(private _formBuilder: UntypedFormBuilder,
              private service: AuctionsService,
              private realmService: RealmService,
              private settingsService: SettingsService,
              private authService: AuthService,
              private dialog: MatDialog,
              private professionService: ProfessionService) {
    SharedService.events.title.next('Crafting');
    this.isClassic = realmService.isClassic;

    const query: CraftingFormFilterModel = localStorage.getItem('query_crafting') === null ?
      undefined : JSON.parse(localStorage.getItem('query_crafting'));

    this.subs.add(ItemClassService.classes, classes => this.itemClasses = classes);

    this.searchForm = new FormGroup({
      searchQuery: new FormControl<string>(query && query.searchQuery !== undefined ? query.searchQuery : ''),
      onlyKnownRecipes: new FormControl<boolean>(this.isClassic ?
        false : (query && query.onlyKnownRecipes !== undefined ? query.onlyKnownRecipes : true)),
      professionId: new FormControl<number>(query && query.professionId ? query.professionId : 0),
      rank: new FormControl<number>(query && query.rank ? query.rank : 0),
      profit: new FormControl<number>(query && query.profit !== null ? +query.profit : null),
      demand: new FormControl<number>(query && query.demand !== null ? +query.demand : null),
      personalSaleRate: new FormControl<number>(query && query.personalSaleRate !== null ? query.personalSaleRate : null),
      minSold: new FormControl<number>(query && query.minSold !== null ? +query.minSold : null),
      itemClass: new FormControl<number>(query ? query.itemClass : -1),
      itemSubClass: new FormControl<number>(query ? query.itemSubClass : -1),
/*
      // Disenchanting
      selectedDEMaterial: new FormControl<number>(query && query.selectedDisenchanting ? query.selectedDisenchanting : 0),
      DEOnlyProfitable: new FormControl<boolean>(query && query.onlyProfitable ? query.onlyProfitable : false),*/
      expansion: new FormControl<number>(
        query && query.expansion ? (
          this.isClassic && query.expansion < GameBuild.latestClassicExpansion ? 0 : query.expansion
        ) : null
      )
    });

    if (authService.isAdmin()) {
      this.columns.push({
        key: '',
        title: 'Edit',
        dataType: ColumnTypeEnum.RowActions,
        actions: [{
          icon: 'fa fa-edit',
          text: '',
          tooltip: 'Edit',
          callback: (group: Recipe) => dialog.open(RecipeDialogComponent, {data: group}),
        }]
      });
    }
  }

  ngOnInit() {
    this.filter();

    this.subs.add(this.searchForm.controls.itemClass.valueChanges,
      () => this.searchForm.controls.itemSubClass.setValue('-1'));

    this.subs.add(
      this.searchForm.valueChanges,
      ((changes) => {
        localStorage['query_crafting'] = JSON.stringify(this.searchForm.value);
        this.lastCalculationTime = +new Date();
        setTimeout(async () => {
          const timeDiff = +new Date() - this.lastCalculationTime;
          if (timeDiff >= 1000) {
            this.filter(changes);
          }
        }, 1000);
      }));

    this.subs.add(
      this.service.mapped,
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
          name: 'On use'
        }
      ];
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setExpansions(): void {
    this.expansions = GameBuild.expansionMap.filter((v, index) => {
      if (this.isClassic) {
        return index <= GameBuild.latestClassicExpansion;
      }
      return true;
    });
  }

  filter(changes: CraftingFormFilterModel = this.searchForm.value): void {
    /**
     * Setting the expansion here in case a user changes between retail and classic while
     * on the recipes page
     */
    this.isClassic = this.realmService.isClassic;
    this.setExpansions();
    this.filtered = CraftingService.list.value
      .filter(recipe => {
        if (!EmptyUtil.isNullOrUndefined(recipe)) {
          return this.isKnownRecipe(recipe)
            && this.isNameMatch(recipe, changes.searchQuery)
            && Filters.isProfitMatch(recipe, undefined, changes.profit)
            && Filters.isPersonalSaleRateMatch(recipe.itemID, changes.demand, false)
            && Filters.isXSmallerThanOrEqualToY(changes.demand, recipe.regionSaleRate)
            && Filters.isXSmallerThanOrEqualToY(changes.rank, recipe.rank)
            && Filters.isDailySoldMatch(recipe.itemID, changes.minSold, false)
            && Filters.recipeIsProfessionMatch(recipe.id, changes.professionId)
            && Filters.isItemClassMatch(recipe.itemID, changes.itemClass, changes.itemSubClass)
            && Filters.isExpansionMatch(recipe.itemID, changes.expansion, this.isClassic);
        }
        return false;
      })
      .map((recipe: Recipe) => {
        const item: AuctionItem[] = this.service.mappedVariations.value.get(recipe.craftedItemId);
        if (!item) {
          return recipe;
        }
        const stats: ItemStats[] = this.service.statsVariations.value.get(recipe.craftedItemId);
        const faction = this.settingsService.settings.value.faction || 0;
        const stat = this.getStatsForItem(item, stats);
        const past60DaysSaleRate = this.getPersonalSaleRateForitem(item);
        const inventoryQuantity = this.getInventoryQuantityForItemAndFaction(item, faction);

        return {
          ...recipe,
          priceAvg24: stat ? stat.past24Hours.price.avg : 0,
          priceTrend: stat ? stat.past7Days.price.trend : 0,
          regionSaleRate: stat && stat.tsm?.salePct ? stat.tsm?.salePct : 0,
          past60DaysSaleRate,
          inventoryQuantity,
        };
      });
  }

  private getStatsForItem(item: AuctionItem[], stats: ItemStats[]) {
    return (item[0] && item[0].stats) || (stats && stats[0]) ?
      item[0].stats || stats[0] : undefined;
  }

  private getPersonalSaleRateForitem(item: AuctionItem[]) {
    return item[0] && item[0].past60DaysSaleRate ? item[0].past60DaysSaleRate : 0.001;
  }

  private getInventoryQuantityForItemAndFaction(item: AuctionItem[], faction: number) {
    return item[0] && item[0].item && item[0].item.inventory ?
      item[0].item.inventory[faction] ? item[0].item.inventory[faction].quantity : 0
      : 0;
  }

  isKnownRecipe(recipe: Recipe): boolean {
    return !this.searchForm.value.onlyKnownRecipes ||
      CraftingService.recipesForUser.value.has(recipe.id)
      || !recipe.professionId;
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